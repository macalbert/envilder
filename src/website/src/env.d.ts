declare const __APP_VERSION__: string;
declare const __CHANGELOG_CONTENT__: string;
declare const __CHANGELOG_CLI__: string;
declare const __CHANGELOG_GHA__: string;
declare const __CHANGELOG_SDK_DOTNET__: string;
declare const __CHANGELOG_SDK_PYTHON__: string;
declare const __CHANGELOG_SDK_NODEJS__: string;
declare const __SDK_DOTNET_VERSION__: string;
declare const __SDK_PYTHON_VERSION__: string;
declare const __SDK_NODEJS_VERSION__: string;

interface Window {
  gtag?: (...args: unknown[]) => void;
}
