import { fork, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Configuration
const env = process.env;

// Parse CLI arguments
const args = process.argv.slice(2);
let maxInstances = Number(env.MAX_INSTANCES || 2);
for (const arg of args) {
  if (arg.startsWith('--maxInstances=')) {
    maxInstances = Number(arg.split('=')[1]);
  }
}

const tests = [
  { name: 'YouTube', path: path.join(__dirname, 'tests', 'youtube.test.js') },
  { name: 'JioHotstar', path: path.join(__dirname, 'tests', 'jiohotstar.test.js') }
];

console.log(`====================================================`);
console.log(`Starting Parallel Test Runner (Max Instances: ${maxInstances})`);
console.log(`====================================================\n`);

// 2. Discover Connected Devices via ADB
let devices = [];
try {
  const adbOutput = execSync('adb devices', { encoding: 'utf8' });
  const lines = adbOutput.split('\n');
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 2 && parts[1] === 'device') {
      devices.push({ udid: parts[0], systemPort: 8200 + devices.length });
    }
  }
  if (devices.length > 0) {
    console.log(`Discovered ${devices.length} connected device(s) via ADB:`);
    devices.forEach((d, idx) => console.log(`  [Device ${idx + 1}] UDID: ${d.udid}, System Port: ${d.systemPort}`));
  }
} catch (err) {
  console.warn('Warning: Failed to execute adb devices. Fallback to default devices config.', err.message);
}

// Fallback to default devices if none found (so user configuration/defaults can be used)
if (devices.length === 0) {
  const defaultUdid = env.ANDROID_UDID || '77eff566';
  console.log(`No devices found via ADB. Using default device configuration:`);
  console.log(`  [Default Device] UDID: ${defaultUdid}, System Port: 8200`);
  devices = [
    { udid: defaultUdid, systemPort: 8200 },
    { udid: 'emulator-5554', systemPort: 8201 },
    { udid: 'emulator-5556', systemPort: 8202 }
  ];
}

// 3. Setup Queue and Execution
const queue = [...tests];
const activeWorkers = [];
const results = [];
const devicePool = [...devices].map(d => ({ ...d, isBusy: false }));

function getAvailableDevice() {
  return devicePool.find(d => !d.isBusy);
}

function runNextTest() {
  if (queue.length === 0 && activeWorkers.length === 0) {
    printSummaryAndExit();
    return;
  }

  // Determine concurrency limit: minimum of maxInstances and available devices
  const concurrentLimit = Math.min(maxInstances, devicePool.length);

  while (activeWorkers.length < concurrentLimit && queue.length > 0) {
    const device = getAvailableDevice();
    if (!device) {
      // All devices are currently busy
      break;
    }

    const test = queue.shift();
    device.isBusy = true;

    console.log(`[LAUNCH] Running "${test.name}" on device ${device.udid} (System Port: ${device.systemPort})...`);

    const workerEnv = {
      ...process.env,
      ANDROID_UDID: device.udid,
      APPIUM_SYSTEM_PORT: String(device.systemPort)
    };

    // Fork a child process to run the test script
    const child = fork(test.path, [], {
      env: workerEnv,
      stdio: ['inherit', 'pipe', 'pipe', 'ipc']
    });

    const worker = { test, device, child, stdout: '', stderr: '' };
    activeWorkers.push(worker);

    child.stdout.on('data', (data) => {
      worker.stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      worker.stderr += data.toString();
    });

    child.on('close', (code) => {
      // Release device
      device.isBusy = false;

      // Remove from active workers
      const index = activeWorkers.indexOf(worker);
      if (index > -1) activeWorkers.splice(index, 1);

      // Record result
      const success = code === 0;
      results.push({ test, device, success, code, stdout: worker.stdout, stderr: worker.stderr });

      console.log(`[FINISHED] "${test.name}" completed on device ${device.udid} with exit code ${code} (${success ? 'PASS' : 'FAIL'}).`);

      // Print output prefix to separate test outputs
      console.log(`\n--- Output from "${test.name}" ---`);
      if (worker.stdout.trim()) {
        console.log(worker.stdout.trim());
      }
      if (worker.stderr.trim()) {
        console.error(worker.stderr.trim());
      }
      console.log(`---------------------------------\n`);

      // Run next
      runNextTest();
    });
  }
}

function printSummaryAndExit() {
  console.log(`====================================================`);
  console.log(`Test Execution Summary:`);
  console.log(`====================================================`);

  let allPassed = true;
  for (const res of results) {
    const status = res.success ? 'PASS' : 'FAIL';
    console.log(`- ${res.test.name} on ${res.device.udid}: ${status} (Code: ${res.code})`);
    if (!res.success) {
      allPassed = false;
    }
  }
  console.log(`====================================================`);

  if (allPassed) {
    console.log(`All tests completed successfully!`);
    process.exit(0);
  } else {
    console.error(`Some tests failed. Check outputs above.`);
    process.exit(1);
  }
}

// Start execution
runNextTest();
