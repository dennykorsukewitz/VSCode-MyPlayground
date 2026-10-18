import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { runTests } from '@vscode/test-electron';

function profileDir(name: string): string {
    if (process.platform === 'win32') {
        return path.join(os.tmpdir(), name);
    }
    return path.join('/tmp', name);
}

async function main(): Promise<void> {
    try {
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');
        const extensionTestsPath = path.resolve(__dirname, './suite/index');
        const userDataDir = profileDir('vsc-myplayground-user');
        const extensionsDir = profileDir('vsc-myplayground-ext');
        fs.mkdirSync(userDataDir, { recursive: true });
        fs.mkdirSync(extensionsDir, { recursive: true });
        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [
                `--user-data-dir=${userDataDir}`,
                `--extensions-dir=${extensionsDir}`,
            ],
        });
    } catch (err) {
        console.error('Failed to run tests', err);
        process.exit(1);
    }
}

main();
