import { CreateLinkRequest, LinkResponse } from './dto';

export interface ILinkService {
  create(dto: CreateLinkRequest): Promise<LinkResponse>;
}
