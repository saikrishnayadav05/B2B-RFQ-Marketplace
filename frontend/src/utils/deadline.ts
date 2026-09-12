export function getMinDeadlineInputValue(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function validateFutureDeadline(deadline: string): string | null {
  if (!deadline) {
    return 'Deadline is required';
  }

  if (new Date(deadline) <= new Date()) {
    return 'Deadline must be in the future';
  }

  return null;
}
