/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CipherType, CryptoOptions, TransformMode } from '../types';

export class CryptoService {
  static transform(
    input: string,
    type: CipherType,
    mode: TransformMode,
    options: CryptoOptions = {}
  ): string {
    if (!input) return '';

    switch (type) {
      case CipherType.BASE64:
        return mode === 'encode' 
          ? btoa(input) 
          : (() => { try { return atob(input); } catch { return 'Invalid Base64'; } })();
      
      case CipherType.ROT13:
        return this.rot13(input);

      case CipherType.CAESAR:
        return this.caesar(input, options.shift || 3, mode);

      case CipherType.ATBASH:
        return this.atbash(input);

      case CipherType.HEX:
        return mode === 'encode'
          ? Array.from(input).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')
          : input.split(/\s+/).map(h => String.fromCharCode(parseInt(h, 16))).join('');

      case CipherType.BINARY:
        return mode === 'encode'
          ? Array.from(input).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')
          : input.split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('');

      case CipherType.MORSE:
        return mode === 'encode' ? this.toMorse(input) : this.fromMorse(input);

      case CipherType.VIGENERE:
        return this.vigenere(input, options.key || 'KEY', mode);

      case CipherType.SHA256:
        // Note: Real SHA256 in browser is async, this handles placeholder or we use a library if needed.
        // For now, let's keep it simple or implement a basic sync hash if possible.
        return 'SHA-256 requires async crypto API';

      default:
        return input;
    }
  }

  private static rot13(str: string): string {
    return str.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
  }

  private static caesar(str: string, shift: number, mode: TransformMode): string {
    const s = mode === 'encode' ? shift : (26 - (shift % 26)) % 26;
    return str.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base);
    });
  }

  private static atbash(str: string): string {
    return str.replace(/[a-zA-Z]/g, (c) => {
      const isUpper = c <= 'Z';
      const base = isUpper ? 65 : 97;
      const code = c.charCodeAt(0) - base;
      return String.fromCharCode(base + (25 - code));
    });
  }

  private static toMorse(str: string): string {
    const map: Record<string, string> = {
      'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.',
      'g': '--.', 'h': '....', 'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..',
      'm': '--', 'n': '-.', 'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.',
      's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
      'y': '-.--', 'z': '--..', '1': '.----', '2': '..---', '3': '...--',
      '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
      '9': '----.', '0': '-----', ' ': '/'
    };
    return str.toLowerCase().split('').map(c => map[c] || c).join(' ');
  }

  private static fromMorse(str: string): string {
    const map: Record<string, string> = {
      '.-': 'a', '-...': 'b', '-.-.': 'c', '-..': 'd', '.': 'e', '..-.': 'f',
      '--.': 'g', '....': 'h', '..': 'i', '.---': 'j', '-.-': 'k', '.-..': 'l',
      '--': 'm', '-.': 'n', '---': 'o', '.--.': 'p', '--.-': 'q', '.-.': 'r',
      '...': 's', '-': 't', '..-': 'u', '...-': 'v', '.--': 'w', '-..-': 'x',
      '-.--': 'y', '--..': 'z', '.----': '1', '..---': '2', '...--': '3',
      '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8',
      '----.': '9', '-----': '0', '/': ' '
    };
    return str.split(' ').map(c => map[c] || c).join('');
  }

  private static vigenere(str: string, key: string, mode: TransformMode): string {
    if (!key) return str;
    let result = '';
    const k = key.toUpperCase();
    let j = 0;
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (/[a-zA-Z]/.test(c)) {
        const isUpper = c === c.toUpperCase();
        const base = isUpper ? 65 : 97;
        const charCode = c.toUpperCase().charCodeAt(0) - 65;
        const keyCode = k[j % k.length].charCodeAt(0) - 65;
        let finalCode;
        if (mode === 'encode') {
          finalCode = (charCode + keyCode) % 26;
        } else {
          finalCode = (charCode - keyCode + 26) % 26;
        }
        result += String.fromCharCode(finalCode + base);
        j++;
      } else {
        result += c;
      }
    }
    return result;
  }

  static detectType(input: string): CipherType {
    if (!input) return CipherType.AUTO;
    
    // Simple heuristics
    if (/^[01\s]+$/.test(input) && input.length > 7) return CipherType.BINARY;
    if (/^[0-9a-fA-F\s]+$/.test(input) && input.length > 4) return CipherType.HEX;
    if (/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(input) && input.includes('=')) return CipherType.BASE64;
    if (/^[.\-\s/]+$/.test(input)) return CipherType.MORSE;
    
    return CipherType.ROT13; // Default fallback for alphabetic
  }
}
