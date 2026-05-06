/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum CipherType {
  BASE64 = 'base64',
  ROT13 = 'rot13',
  CAESAR = 'caesar',
  VIGENERE = 'vigenere',
  MORSE = 'morse',
  ATBASH = 'atbash',
  HEX = 'hex',
  BINARY = 'binary',
  SHA256 = 'sha256',
  MD5 = 'md5',
  AUTO = 'auto'
}

export type TransformMode = 'encode' | 'decode';

export interface CryptoOptions {
  shift?: number;
  key?: string;
}

export interface CipherDefinition {
  id: CipherType;
  label: string;
  description: string;
  canDecode: boolean;
}
