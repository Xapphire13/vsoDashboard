/**
 * Access token given by VSTS
 */
export interface IAccessToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}
