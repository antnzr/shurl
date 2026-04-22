import {
  LinkResponse,
  CreateLinkRequest,
  UpdateLinkExpirationRequest,
} from './dto';

export interface ILinkService {
  create(dto: CreateLinkRequest): Promise<LinkResponse>;
  updateExpiration(dto: UpdateLinkExpirationRequest): Promise<LinkResponse>;
}
