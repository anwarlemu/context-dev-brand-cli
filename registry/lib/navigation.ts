/** Lets the host router handle a block's navigation before falling back to a normal page load. */
export function navigate(href: string) {
  const event = new CustomEvent("ds:navigate", { detail: { href }, cancelable: true });
  if (window.dispatchEvent(event)) window.location.assign(href);
}
