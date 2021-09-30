import bigInt from 'big-integer'
import { Request, Response } from 'express'
import { Api } from 'telegram'
import { Endpoint } from '../base/Endpoint'
import { Auth } from '../middlewares/Auth'

@Endpoint.API()
export class Messages {

  @Endpoint.GET('/:type/:id', { middlewares: [Auth] })
  public async find(req: Request, res: Response): Promise<any> {
    const { type, id } = req.params
    const { skip, take } = req.query

    let peer: Api.InputPeerChannel | Api.InputPeerUser
    if (type === 'channel') {
      peer = new Api.InputPeerChannel({
        channelId: Number(id),
        accessHash: bigInt(req.query.accessHash as string) })
    } else if (type === 'user') {
      peer = new Api.InputPeerUser({
        userId: Number(id),
        accessHash: bigInt(req.query.accessHash as string) })
    }

    const messages = await req.tg.invoke(new Api.messages.GetHistory({
      peer: peer,
      limit: Number(take) || 0,
      offsetDate: Number(skip) || 0
    }))
    return res.send({ messages })
  }

  @Endpoint.GET('/:type/:id/avatar.jpg', { middlewares: [Auth] })
  public async avatar(req: Request, res: Response): Promise<any> {
    const { type, id } = req.params
    let peer: Api.InputPeerChannel | Api.InputPeerUser
    if (type === 'channel') {
      peer = new Api.InputPeerChannel({
        channelId: Number(id),
        accessHash: bigInt(req.query.accessHash as string) })
    } else if (type === 'user') {
      peer = new Api.InputPeerUser({
        userId: Number(id),
        accessHash: bigInt(req.query.accessHash as string) })
    }
    const file = await req.tg.downloadProfilePhoto(peer)
    res.setHeader('Content-Disposition', `inline; filename=avatar-${id}.jpg`)
    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Content-Length', file.length)
    res.write(file)
    return res.end()
  }
}