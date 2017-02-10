export function stub(obj, keys) {
  (keys instanceof Array ? keys : [keys])
    .forEach(k => mock(obj, k, jest.fn()))
}

export function unstub(obj, keys) {
  (keys instanceof Array ? keys : [keys])
    .forEach(k => unmock(obj, k))
}

export function spy(obj, keys) {
  (keys instanceof Array ? keys : [keys])
    .forEach(k => mock(obj, k, jest.fn(obj[k])))
}
export const unspy = unstub

export function mock(obj, key, fn) {
  if (!obj[`_${key}`]) {
    obj[`_${key}`] = obj[key]
  }

  obj[key] = fn
}

export function unmock(obj, key) {
  obj[key] = obj[`_${key}`]
  delete obj[`_${key}`]
}
