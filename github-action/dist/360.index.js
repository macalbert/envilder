export const id = 360;
export const ids = [360];
export const modules = {

/***/ 6360:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  apps: () => (/* binding */ apps),
  "default": () => (/* binding */ node_modules_open),
  openApp: () => (/* binding */ openApp)
});

// EXTERNAL MODULE: external "node:process"
var external_node_process_ = __webpack_require__(1708);
// EXTERNAL MODULE: external "node:buffer"
var external_node_buffer_ = __webpack_require__(4573);
// EXTERNAL MODULE: external "node:path"
var external_node_path_ = __webpack_require__(6760);
// EXTERNAL MODULE: external "node:url"
var external_node_url_ = __webpack_require__(3136);
// EXTERNAL MODULE: external "node:util"
var external_node_util_ = __webpack_require__(7975);
// EXTERNAL MODULE: external "node:child_process"
var external_node_child_process_ = __webpack_require__(1421);
// EXTERNAL MODULE: external "node:fs/promises"
var promises_ = __webpack_require__(1455);
// EXTERNAL MODULE: external "node:os"
var external_node_os_ = __webpack_require__(8161);
// EXTERNAL MODULE: external "node:fs"
var external_node_fs_ = __webpack_require__(3024);
;// CONCATENATED MODULE: ./node_modules/.pnpm/is-docker@3.0.0/node_modules/is-docker/index.js


let isDockerCached;

function hasDockerEnv() {
	try {
		external_node_fs_.statSync('/.dockerenv');
		return true;
	} catch {
		return false;
	}
}

function hasDockerCGroup() {
	try {
		return external_node_fs_.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
	} catch {
		return false;
	}
}

function isDocker() {
	// TODO: Use `??=` when targeting Node.js 16.
	if (isDockerCached === undefined) {
		isDockerCached = hasDockerEnv() || hasDockerCGroup();
	}

	return isDockerCached;
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/is-inside-container@1.0.0/node_modules/is-inside-container/index.js



let cachedResult;

// Podman detection
const hasContainerEnv = () => {
	try {
		external_node_fs_.statSync('/run/.containerenv');
		return true;
	} catch {
		return false;
	}
};

function isInsideContainer() {
	// TODO: Use `??=` when targeting Node.js 16.
	if (cachedResult === undefined) {
		cachedResult = hasContainerEnv() || isDocker();
	}

	return cachedResult;
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/is-wsl@3.1.1/node_modules/is-wsl/index.js





const isWsl = () => {
	if (external_node_process_.platform !== 'linux') {
		return false;
	}

	if (external_node_os_.release().toLowerCase().includes('microsoft')) {
		if (isInsideContainer()) {
			return false;
		}

		return true;
	}

	try {
		if (external_node_fs_.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft')) {
			return !isInsideContainer();
		}
	} catch {}

	// Fallback for custom kernels: check WSL-specific paths.
	if (
		external_node_fs_.existsSync('/proc/sys/fs/binfmt_misc/WSLInterop')
		|| external_node_fs_.existsSync('/run/WSL')
	) {
		return !isInsideContainer();
	}

	return false;
};

/* harmony default export */ const is_wsl = (external_node_process_.env.__IS_WSL_TEST__ ? isWsl : isWsl());

;// CONCATENATED MODULE: ./node_modules/.pnpm/wsl-utils@0.1.0/node_modules/wsl-utils/index.js




const wslDrivesMountPoint = (() => {
	// Default value for "root" param
	// according to https://docs.microsoft.com/en-us/windows/wsl/wsl-config
	const defaultMountPoint = '/mnt/';

	let mountPoint;

	return async function () {
		if (mountPoint) {
			// Return memoized mount point value
			return mountPoint;
		}

		const configFilePath = '/etc/wsl.conf';

		let isConfigFileExists = false;
		try {
			await promises_.access(configFilePath, promises_.constants.F_OK);
			isConfigFileExists = true;
		} catch {}

		if (!isConfigFileExists) {
			return defaultMountPoint;
		}

		const configContent = await promises_.readFile(configFilePath, {encoding: 'utf8'});
		const configMountPoint = /(?<!#.*)root\s*=\s*(?<mountPoint>.*)/g.exec(configContent);

		if (!configMountPoint) {
			return defaultMountPoint;
		}

		mountPoint = configMountPoint.groups.mountPoint.trim();
		mountPoint = mountPoint.endsWith('/') ? mountPoint : `${mountPoint}/`;

		return mountPoint;
	};
})();

const powerShellPathFromWsl = async () => {
	const mountPoint = await wslDrivesMountPoint();
	return `${mountPoint}c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe`;
};

const powerShellPath = async () => {
	if (is_wsl) {
		return powerShellPathFromWsl();
	}

	return `${external_node_process_.env.SYSTEMROOT || external_node_process_.env.windir || String.raw`C:\Windows`}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`;
};



;// CONCATENATED MODULE: ./node_modules/.pnpm/define-lazy-prop@3.0.0/node_modules/define-lazy-prop/index.js
function defineLazyProperty(object, propertyName, valueGetter) {
	const define = value => Object.defineProperty(object, propertyName, {value, enumerable: true, writable: true});

	Object.defineProperty(object, propertyName, {
		configurable: true,
		enumerable: true,
		get() {
			const result = valueGetter();
			define(result);
			return result;
		},
		set(value) {
			define(value);
		}
	});

	return object;
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/default-browser-id@5.0.1/node_modules/default-browser-id/index.js




const execFileAsync = (0,external_node_util_.promisify)(external_node_child_process_.execFile);

async function defaultBrowserId() {
	if (external_node_process_.platform !== 'darwin') {
		throw new Error('macOS only');
	}

	const {stdout} = await execFileAsync('defaults', ['read', 'com.apple.LaunchServices/com.apple.launchservices.secure', 'LSHandlers']);

	// `(?!-)` is to prevent matching `LSHandlerRoleAll = "-";`.
	const match = /LSHandlerRoleAll = "(?!-)(?<id>[^"]+?)";\s+?LSHandlerURLScheme = (?:http|https);/.exec(stdout);

	const browserId = match?.groups.id ?? 'com.apple.Safari';

	// Correct the case for Safari's bundle identifier
	if (browserId === 'com.apple.safari') {
		return 'com.apple.Safari';
	}

	return browserId;
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/run-applescript@7.1.0/node_modules/run-applescript/index.js




const run_applescript_execFileAsync = (0,external_node_util_.promisify)(external_node_child_process_.execFile);

async function runAppleScript(script, {humanReadableOutput = true, signal} = {}) {
	if (external_node_process_.platform !== 'darwin') {
		throw new Error('macOS only');
	}

	const outputArguments = humanReadableOutput ? [] : ['-ss'];

	const execOptions = {};
	if (signal) {
		execOptions.signal = signal;
	}

	const {stdout} = await run_applescript_execFileAsync('osascript', ['-e', script, outputArguments], execOptions);
	return stdout.trim();
}

function runAppleScriptSync(script, {humanReadableOutput = true} = {}) {
	if (process.platform !== 'darwin') {
		throw new Error('macOS only');
	}

	const outputArguments = humanReadableOutput ? [] : ['-ss'];

	const stdout = execFileSync('osascript', ['-e', script, ...outputArguments], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'ignore'],
		timeout: 500,
	});

	return stdout.trim();
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/bundle-name@4.1.0/node_modules/bundle-name/index.js


async function bundleName(bundleId) {
	return runAppleScript(`tell application "Finder" to set app_path to application file id "${bundleId}" as string\ntell application "System Events" to get value of property list item "CFBundleName" of property list file (app_path & ":Contents:Info.plist")`);
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/default-browser@5.5.0/node_modules/default-browser/windows.js



const windows_execFileAsync = (0,external_node_util_.promisify)(external_node_child_process_.execFile);

// TODO: Fix the casing of bundle identifiers in the next major version.

// Windows doesn't have browser IDs in the same way macOS/Linux does so we give fake
// ones that look real and match the macOS/Linux versions for cross-platform apps.
const windowsBrowserProgIds = {
	MSEdgeHTM: {name: 'Edge', id: 'com.microsoft.edge'}, // The missing `L` is correct.
	MSEdgeBHTML: {name: 'Edge Beta', id: 'com.microsoft.edge.beta'},
	MSEdgeDHTML: {name: 'Edge Dev', id: 'com.microsoft.edge.dev'},
	AppXq0fevzme2pys62n3e0fbqa7peapykr8v: {name: 'Edge', id: 'com.microsoft.edge.old'},
	ChromeHTML: {name: 'Chrome', id: 'com.google.chrome'},
	ChromeBHTML: {name: 'Chrome Beta', id: 'com.google.chrome.beta'},
	ChromeDHTML: {name: 'Chrome Dev', id: 'com.google.chrome.dev'},
	ChromiumHTM: {name: 'Chromium', id: 'org.chromium.Chromium'},
	BraveHTML: {name: 'Brave', id: 'com.brave.Browser'},
	BraveBHTML: {name: 'Brave Beta', id: 'com.brave.Browser.beta'},
	BraveDHTML: {name: 'Brave Dev', id: 'com.brave.Browser.dev'},
	BraveSSHTM: {name: 'Brave Nightly', id: 'com.brave.Browser.nightly'},
	FirefoxURL: {name: 'Firefox', id: 'org.mozilla.firefox'},
	OperaStable: {name: 'Opera', id: 'com.operasoftware.Opera'},
	VivaldiHTM: {name: 'Vivaldi', id: 'com.vivaldi.Vivaldi'},
	'IE.HTTP': {name: 'Internet Explorer', id: 'com.microsoft.ie'},
};

const _windowsBrowserProgIdMap = new Map(Object.entries(windowsBrowserProgIds));

class UnknownBrowserError extends Error {}

async function defaultBrowser(_execFileAsync = windows_execFileAsync) {
	const {stdout} = await _execFileAsync('reg', [
		'QUERY',
		' HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice',
		'/v',
		'ProgId',
	]);

	const match = /ProgId\s*REG_SZ\s*(?<id>\S+)/.exec(stdout);
	if (!match) {
		throw new UnknownBrowserError(`Cannot find Windows browser in stdout: ${JSON.stringify(stdout)}`);
	}

	const {id} = match.groups;

	// Windows can append a hash suffix to ProgIds using a dot or hyphen
	// (e.g., `ChromeHTML.ABC123`, `FirefoxURL-6F193CCC56814779`).
	// Try exact match first, then try without the suffix.
	const dotIndex = id.lastIndexOf('.');
	const hyphenIndex = id.lastIndexOf('-');
	const baseIdByDot = dotIndex === -1 ? undefined : id.slice(0, dotIndex);
	const baseIdByHyphen = hyphenIndex === -1 ? undefined : id.slice(0, hyphenIndex);

	return windowsBrowserProgIds[id] ?? windowsBrowserProgIds[baseIdByDot] ?? windowsBrowserProgIds[baseIdByHyphen] ?? {name: id, id};
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/default-browser@5.5.0/node_modules/default-browser/index.js









const default_browser_execFileAsync = (0,external_node_util_.promisify)(external_node_child_process_.execFile);

// Inlined: https://github.com/sindresorhus/titleize/blob/main/index.js
const titleize = string => string.toLowerCase().replaceAll(/(?:^|\s|-)\S/g, x => x.toUpperCase());

async function default_browser_defaultBrowser() {
	if (external_node_process_.platform === 'darwin') {
		const id = await defaultBrowserId();
		const name = await bundleName(id);
		return {name, id};
	}

	if (external_node_process_.platform === 'linux') {
		const {stdout} = await default_browser_execFileAsync('xdg-mime', ['query', 'default', 'x-scheme-handler/http']);
		const id = stdout.trim();
		const name = titleize(id.replace(/.desktop$/, '').replace('-', ' '));
		return {name, id};
	}

	if (external_node_process_.platform === 'win32') {
		return defaultBrowser();
	}

	throw new Error('Only macOS, Linux, and Windows are supported');
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/open@10.2.0/node_modules/open/index.js












const execFile = (0,external_node_util_.promisify)(external_node_child_process_.execFile);

// Path to included `xdg-open`.
const open_dirname = external_node_path_.dirname((0,external_node_url_.fileURLToPath)(import.meta.url));
const localXdgOpenPath = external_node_path_.join(open_dirname, 'xdg-open');

const {platform, arch} = external_node_process_;

/**
Get the default browser name in Windows from WSL.

@returns {Promise<string>} Browser name.
*/
async function getWindowsDefaultBrowserFromWsl() {
	const powershellPath = await powerShellPath();
	const rawCommand = String.raw`(Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\Shell\Associations\UrlAssociations\http\UserChoice").ProgId`;
	const encodedCommand = external_node_buffer_.Buffer.from(rawCommand, 'utf16le').toString('base64');

	const {stdout} = await execFile(
		powershellPath,
		[
			'-NoProfile',
			'-NonInteractive',
			'-ExecutionPolicy',
			'Bypass',
			'-EncodedCommand',
			encodedCommand,
		],
		{encoding: 'utf8'},
	);

	const progId = stdout.trim();

	// Map ProgId to browser IDs
	const browserMap = {
		ChromeHTML: 'com.google.chrome',
		BraveHTML: 'com.brave.Browser',
		MSEdgeHTM: 'com.microsoft.edge',
		FirefoxURL: 'org.mozilla.firefox',
	};

	return browserMap[progId] ? {id: browserMap[progId]} : {};
}

const pTryEach = async (array, mapper) => {
	let latestError;

	for (const item of array) {
		try {
			return await mapper(item); // eslint-disable-line no-await-in-loop
		} catch (error) {
			latestError = error;
		}
	}

	throw latestError;
};

// eslint-disable-next-line complexity
const baseOpen = async options => {
	options = {
		wait: false,
		background: false,
		newInstance: false,
		allowNonzeroExitCode: false,
		...options,
	};

	if (Array.isArray(options.app)) {
		return pTryEach(options.app, singleApp => baseOpen({
			...options,
			app: singleApp,
		}));
	}

	let {name: app, arguments: appArguments = []} = options.app ?? {};
	appArguments = [...appArguments];

	if (Array.isArray(app)) {
		return pTryEach(app, appName => baseOpen({
			...options,
			app: {
				name: appName,
				arguments: appArguments,
			},
		}));
	}

	if (app === 'browser' || app === 'browserPrivate') {
		// IDs from default-browser for macOS and windows are the same
		const ids = {
			'com.google.chrome': 'chrome',
			'google-chrome.desktop': 'chrome',
			'com.brave.Browser': 'brave',
			'org.mozilla.firefox': 'firefox',
			'firefox.desktop': 'firefox',
			'com.microsoft.msedge': 'edge',
			'com.microsoft.edge': 'edge',
			'com.microsoft.edgemac': 'edge',
			'microsoft-edge.desktop': 'edge',
		};

		// Incognito flags for each browser in `apps`.
		const flags = {
			chrome: '--incognito',
			brave: '--incognito',
			firefox: '--private-window',
			edge: '--inPrivate',
		};

		const browser = is_wsl ? await getWindowsDefaultBrowserFromWsl() : await default_browser_defaultBrowser();
		if (browser.id in ids) {
			const browserName = ids[browser.id];

			if (app === 'browserPrivate') {
				appArguments.push(flags[browserName]);
			}

			return baseOpen({
				...options,
				app: {
					name: apps[browserName],
					arguments: appArguments,
				},
			});
		}

		throw new Error(`${browser.name} is not supported as a default browser`);
	}

	let command;
	const cliArguments = [];
	const childProcessOptions = {};

	if (platform === 'darwin') {
		command = 'open';

		if (options.wait) {
			cliArguments.push('--wait-apps');
		}

		if (options.background) {
			cliArguments.push('--background');
		}

		if (options.newInstance) {
			cliArguments.push('--new');
		}

		if (app) {
			cliArguments.push('-a', app);
		}
	} else if (platform === 'win32' || (is_wsl && !isInsideContainer() && !app)) {
		command = await powerShellPath();

		cliArguments.push(
			'-NoProfile',
			'-NonInteractive',
			'-ExecutionPolicy',
			'Bypass',
			'-EncodedCommand',
		);

		if (!is_wsl) {
			childProcessOptions.windowsVerbatimArguments = true;
		}

		const encodedArguments = ['Start'];

		if (options.wait) {
			encodedArguments.push('-Wait');
		}

		if (app) {
			// Double quote with double quotes to ensure the inner quotes are passed through.
			// Inner quotes are delimited for PowerShell interpretation with backticks.
			encodedArguments.push(`"\`"${app}\`""`);
			if (options.target) {
				appArguments.push(options.target);
			}
		} else if (options.target) {
			encodedArguments.push(`"${options.target}"`);
		}

		if (appArguments.length > 0) {
			appArguments = appArguments.map(argument => `"\`"${argument}\`""`);
			encodedArguments.push('-ArgumentList', appArguments.join(','));
		}

		// Using Base64-encoded command, accepted by PowerShell, to allow special characters.
		options.target = external_node_buffer_.Buffer.from(encodedArguments.join(' '), 'utf16le').toString('base64');
	} else {
		if (app) {
			command = app;
		} else {
			// When bundled by Webpack, there's no actual package file path and no local `xdg-open`.
			const isBundled = !open_dirname || open_dirname === '/';

			// Check if local `xdg-open` exists and is executable.
			let exeLocalXdgOpen = false;
			try {
				await promises_.access(localXdgOpenPath, promises_.constants.X_OK);
				exeLocalXdgOpen = true;
			} catch {}

			const useSystemXdgOpen = external_node_process_.versions.electron
				?? (platform === 'android' || isBundled || !exeLocalXdgOpen);
			command = useSystemXdgOpen ? 'xdg-open' : localXdgOpenPath;
		}

		if (appArguments.length > 0) {
			cliArguments.push(...appArguments);
		}

		if (!options.wait) {
			// `xdg-open` will block the process unless stdio is ignored
			// and it's detached from the parent even if it's unref'd.
			childProcessOptions.stdio = 'ignore';
			childProcessOptions.detached = true;
		}
	}

	if (platform === 'darwin' && appArguments.length > 0) {
		cliArguments.push('--args', ...appArguments);
	}

	// This has to come after `--args`.
	if (options.target) {
		cliArguments.push(options.target);
	}

	const subprocess = external_node_child_process_.spawn(command, cliArguments, childProcessOptions);

	if (options.wait) {
		return new Promise((resolve, reject) => {
			subprocess.once('error', reject);

			subprocess.once('close', exitCode => {
				if (!options.allowNonzeroExitCode && exitCode > 0) {
					reject(new Error(`Exited with code ${exitCode}`));
					return;
				}

				resolve(subprocess);
			});
		});
	}

	subprocess.unref();

	return subprocess;
};

const open_open = (target, options) => {
	if (typeof target !== 'string') {
		throw new TypeError('Expected a `target`');
	}

	return baseOpen({
		...options,
		target,
	});
};

const openApp = (name, options) => {
	if (typeof name !== 'string' && !Array.isArray(name)) {
		throw new TypeError('Expected a valid `name`');
	}

	const {arguments: appArguments = []} = options ?? {};
	if (appArguments !== undefined && appArguments !== null && !Array.isArray(appArguments)) {
		throw new TypeError('Expected `appArguments` as Array type');
	}

	return baseOpen({
		...options,
		app: {
			name,
			arguments: appArguments,
		},
	});
};

function detectArchBinary(binary) {
	if (typeof binary === 'string' || Array.isArray(binary)) {
		return binary;
	}

	const {[arch]: archBinary} = binary;

	if (!archBinary) {
		throw new Error(`${arch} is not supported`);
	}

	return archBinary;
}

function detectPlatformBinary({[platform]: platformBinary}, {wsl}) {
	if (wsl && is_wsl) {
		return detectArchBinary(wsl);
	}

	if (!platformBinary) {
		throw new Error(`${platform} is not supported`);
	}

	return detectArchBinary(platformBinary);
}

const apps = {};

defineLazyProperty(apps, 'chrome', () => detectPlatformBinary({
	darwin: 'google chrome',
	win32: 'chrome',
	linux: ['google-chrome', 'google-chrome-stable', 'chromium'],
}, {
	wsl: {
		ia32: '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
		x64: ['/mnt/c/Program Files/Google/Chrome/Application/chrome.exe', '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe'],
	},
}));

defineLazyProperty(apps, 'brave', () => detectPlatformBinary({
	darwin: 'brave browser',
	win32: 'brave',
	linux: ['brave-browser', 'brave'],
}, {
	wsl: {
		ia32: '/mnt/c/Program Files (x86)/BraveSoftware/Brave-Browser/Application/brave.exe',
		x64: ['/mnt/c/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', '/mnt/c/Program Files (x86)/BraveSoftware/Brave-Browser/Application/brave.exe'],
	},
}));

defineLazyProperty(apps, 'firefox', () => detectPlatformBinary({
	darwin: 'firefox',
	win32: String.raw`C:\Program Files\Mozilla Firefox\firefox.exe`,
	linux: 'firefox',
}, {
	wsl: '/mnt/c/Program Files/Mozilla Firefox/firefox.exe',
}));

defineLazyProperty(apps, 'edge', () => detectPlatformBinary({
	darwin: 'microsoft edge',
	win32: 'msedge',
	linux: ['microsoft-edge', 'microsoft-edge-dev'],
}, {
	wsl: '/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
}));

defineLazyProperty(apps, 'browser', () => 'browser');

defineLazyProperty(apps, 'browserPrivate', () => 'browserPrivate');

/* harmony default export */ const node_modules_open = (open_open);


/***/ })

};
