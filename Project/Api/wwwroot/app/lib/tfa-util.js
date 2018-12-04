(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global.TfaUtil = factory());
}(this, (function () {
    'use strict';

    var base32_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    return {
        generateBase32Secret: generateBase32Secret,
        verifyPinAgainstSecret: verifyPinAgainstSecret
    };

    function generateBase32Secret(length) {
        return binarytobase32(randombinary(length));
    }

    function verifyPinAgainstSecret(tfaSecret, totpCode, timeCorrection, verificationWindow) {
        timeCorrection = timeCorrection || 0;
        var previousStep = 0;
        var futureStep = 0;
        if (verificationWindow && verificationWindow.previousStep) {
            previousStep = -verificationWindow.previousStep;
        }
        if (verificationWindow && verificationWindow.futureStep) {
            futureStep = verificationWindow.futureStep;
        }

        var key = base32tohex(tfaSecret);
        var epoch = Math.round((new Date().getTime() + timeCorrection) / 1000.0);

        for (var i = previousStep; i <= futureStep; i++) {
            var time = leftpad(dec2hex(Math.floor(epoch / 30) + i), 16, '0');

            // http://caligatio.github.io/jsSHA/
            var shaObj = new jsSHA("SHA-1", "HEX");
            shaObj.setHMACKey(key, "HEX");
            shaObj.update(time);
            var hmac = shaObj.getHMAC("HEX");

            var offset = hex2dec(hmac.substring(hmac.length - 1));

            var otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
            otp = (otp).substr(otp.length - 6, 6);

            if (totpCode === otp)  {
                return true;
            }
        }
        return false;
    }

    function dec2hex(s) {
        return (s < 15.5 ? '0' : '') + Math.round(s).toString(16);
    }

    function hex2dec(s) {
        return parseInt(s, 16);
    }

    function base32tohex(base32) {
        var bits = "";
        var hex = "";

        for (var i = 0; i < base32.length; i++) {
            var val = base32_chars.indexOf(base32.charAt(i).toUpperCase());
            bits += leftpad(val.toString(2), 5, '0');
        }

        for (var i = 0; i + 4 <= bits.length; i += 4) {
            var chunk = bits.substr(i, 4);
            hex = hex + parseInt(chunk, 2).toString(16);
        }
        return hex;
    }

    function leftpad(str, len, pad) {
        if (len + 1 >= str.length) {
            str = Array(len + 1 - str.length).join(pad) + str;
        }
        return str;
    }

    function randombinary(length) {
        var binary = new Array();
        for (var i = 0; i < length; i++) {
            binary[i] = Math.floor(Math.random() * 256);
        }
        return binary;
    }

    function binarytobase32(input) {
        var ret = new Array();
        var ret_len = 0;
        var i = 0;

        var unpadded_length = input.length;
        while (input.length % 5) {
            input[input.length] = 0;
        }

        for (i = 0; i < input.length; i += 5) {
            ret += base32_chars.charAt((input[i] >> 3));
            ret += base32_chars.charAt(((input[i] & 0x07) << 2) | ((input[i + 1] & 0xc0) >> 6));
            if (i + 1 >= unpadded_length) {
                ret += "======"
                break;
            }
            ret += base32_chars.charAt(((input[i + 1] & 0x3e) >> 1));
            ret += base32_chars.charAt(((input[i + 1] & 0x01) << 4) | ((input[i + 2] & 0xf0) >> 4));
            if (i + 2 >= unpadded_length) {
                ret += "===="
                break;
            }
            ret += base32_chars.charAt(((input[i + 2] & 0x0f) << 1) | ((input[i + 3] & 0x80) >> 7));
            if (i + 3 >= unpadded_length) {
                ret += "==="
                break;
            }
            ret += base32_chars.charAt(((input[i + 3] & 0x7c) >> 2));
            ret += base32_chars.charAt(((input[i + 3] & 0x03) << 3) | ((input[i + 4] & 0xe0) >> 5));
            if (i + 4 >= unpadded_length) {
                ret += "="
                break;
            }
            ret += base32_chars.charAt(((input[i + 4] & 0x1f)));
        }
        return ret;
    }
})));