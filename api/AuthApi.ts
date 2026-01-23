import { LoginPayloadModel } from '../types/LoginPayloadModel';
import { Api } from './Client';

export const loginApi = (payload: LoginPayloadModel) =>
    Api.postApi('/auth', JSON.stringify(payload));
