type AnalyticsEventName =
  | 'click_get_started'
  | 'click_github'
  | 'click_package'
  | 'copy_code'
  | 'copy_install_command'
  | 'select_provider'
  | 'select_runtime';

const eventNames = new Set<AnalyticsEventName>([
  'click_get_started',
  'click_github',
  'click_package',
  'copy_code',
  'copy_install_command',
  'select_provider',
  'select_runtime',
]);

function getLocale(): string {
  return window.location.pathname.match(/^\/(ca|es)(?=\/|$)/)?.[1] ?? 'en';
}

function getEventParameters(element: HTMLElement): Record<string, string> {
  const parameters: Record<string, string> = {
    page_path: window.location.pathname,
    locale: getLocale(),
  };
  const parameterNames = [
    'placement',
    'registry',
    'runtime',
    'provider',
    'contentId',
    'language',
    'packageManager',
  ] as const;

  for (const name of parameterNames) {
    const value =
      element.dataset[`analytics${name[0].toUpperCase()}${name.slice(1)}`];
    if (value) {
      parameters[
        name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      ] = value;
    }
  }

  return parameters;
}

function trackEvent(element: HTMLElement): void {
  const eventName = element.dataset.analyticsEvent as
    | AnalyticsEventName
    | undefined;

  if (
    !eventName ||
    !eventNames.has(eventName) ||
    typeof window.gtag !== 'function'
  ) {
    return;
  }

  window.gtag('event', eventName, getEventParameters(element));
}

async function copyCommand(element: HTMLElement): Promise<void> {
  const command = element.dataset.copyCommand;

  if (!command) {
    return;
  }

  try {
    await navigator.clipboard.writeText(command);
    trackEvent(element);
    element.dispatchEvent(new CustomEvent('analytics:copied'));
  } catch {
    return;
  }
}

document.addEventListener('click', (event) => {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  const element = target.closest<HTMLElement>('[data-analytics-event]');

  if (!element) {
    return;
  }

  if (element.dataset.copyCommand) {
    void copyCommand(element);
    return;
  }

  trackEvent(element);
});
