export function toJson(value: string) {
  const content = value.replace(/json\n/g, '').replace(/\n/g, '').replace(/```/g, '');
  return JSON.parse(content);
}