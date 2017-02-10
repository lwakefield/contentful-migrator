require('dotenv').config()
import {readFileSync, writeFileSync} from 'fs'

import {info} from '../src/util'
import {enumerate} from '../src/space'

export const sleep = v => new Promise(res => setTimeout(res, v))

export async function cleanSpace (space) {
  info('cleaning up takes some time to get around the caching')
  info('please be patient...')
  await sleep(2000)
  const contentTypes = await enumerate(space.getContentTypes)
  for (const contentType of contentTypes) {
    await cleanContentType(space, contentType)
    await sleep(2000)
    if (contentType.isPublished()) {
      const unpublished = await contentType.unpublish()
      await unpublished.delete()
    } else {
      await contentType.delete()
    }
  }
}

export async function cleanContentType (space, contentType) {
  const entries = await enumerate(
    space.getEntries,
    {content_type: contentType.sys.id}
  )

  for (const entry of entries) {
    if (entry.isPublished()) {
      const unpublished = await entry.unpublish()
      await unpublished.delete()
    } else {
      await entry.delete()
    }
  }
}

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
