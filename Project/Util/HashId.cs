#region

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

#endregion

namespace Util
{
    /// <summary>
    /// http://hashids.org/
    /// Generate YouTube-like hashes from one or many numbers. Use hashids when you do not want to expose your database ids to the user.
    /// </summary>
    public static class HashIds
    {
        public const string
            DefaultAlphabet = "BZ2MYC6DX3QWG7HV4NTJ8KS5PRL9"; //to make Ids look random  *** DO NOT CHANGE!!***

        public const string
            DefaultSeps = "AEIOU"; //when input array replace the comma with SEPS chars  ***DO NOT CHANGE!!***

        public const string DefaultSalt = "";
        public const int MinAlphabetLength = 5;
        public const double SepDiv = 3.5;
        public const double GuardDiv = 12.0;

        private static readonly Regex HexValidator = new Regex("^[0-9a-fA-F]+$", RegexOptions.Compiled);
        private static readonly Regex HexSplitter = new Regex(@"[\w\W]{1,12}", RegexOptions.Compiled);

        private static string _alphabet;
        private static string _seps;
        private static string _guards;

        private static Regex _guardsRegex;
        private static Regex _sepsRegex;
        private static bool _setup;

        private static void Setup()
        {
            if (string.IsNullOrWhiteSpace(DefaultAlphabet)) throw new Exception("alphabet cannot be empty");
            _alphabet = string.Join(string.Empty, DefaultAlphabet.Distinct());
            _seps = DefaultSeps;
            if (_alphabet.Length < 16) throw new Exception("alphabet must contain at least 4 unique characters.");
            SetupSeps();
            SetupGuards();
            _setup = true;
        }

        private static void SetupSeps()
        {
            // seps should contain only characters present in charset; 
            _seps = new String(_seps.Intersect(_alphabet.ToArray()).ToArray());

            // charset should not contain seps.
            _alphabet = new String(_alphabet.Except(_seps.ToArray()).ToArray());

            _seps = ConsistentShuffle(_seps, DefaultSalt);

            if (_seps.Length == 0 || (float)_alphabet.Length / _seps.Length > SepDiv) {
                var sepsLength = (int)Math.Ceiling(_alphabet.Length / SepDiv);
                if (sepsLength == 1)
                    sepsLength = 2;

                if (sepsLength > _seps.Length) {
                    var diff = sepsLength - _seps.Length;
                    _seps += _alphabet.Substring(0, diff);
                    _alphabet = _alphabet.Substring(diff);
                } else _seps = _seps.Substring(0, sepsLength);
            }

            _sepsRegex = new Regex(string.Concat("[", _seps, "]"), RegexOptions.Compiled);
            _alphabet = ConsistentShuffle(_alphabet, DefaultSalt);
        }

        private static void SetupGuards()
        {
            var guardCount = (int)Math.Ceiling(_alphabet.Length / GuardDiv);

            if (_alphabet.Length < 3) {
                _guards = _seps.Substring(0, guardCount);
                _seps = _seps.Substring(guardCount);
            } else {
                _guards = _alphabet.Substring(0, guardCount);
                _alphabet = _alphabet.Substring(guardCount);
            }

            _guardsRegex = new Regex(string.Concat("[", _guards, "]"), RegexOptions.Compiled);
        }

        private static string Hash(int input, string charset)
        {
            var hash = string.Empty;
            do {
                hash = charset[input % charset.Length] + hash;
                input = input / charset.Length;
            } while (input > 0);

            return hash;
        }

        private static int Unhash(string input, string charset)
        {
            return input.Select(t => charset.IndexOf(t))
                .Select((pos, i) => (int)(pos * Math.Pow(charset.Length, input.Length - i - 1))).Sum();
        }

        private static string ConsistentShuffle(string charset, string salt)
        {
            if (string.IsNullOrWhiteSpace(salt)) return charset;
            int p;
            var v = p = 0;
            for (var i = charset.Length - 1; i > 0; i--, v++) {
                v %= salt.Length;
                int n;
                p += n = salt[v];
                var j = (n + v + p) % i;
                var temp = charset[j];
                charset = charset.Substring(0, j) + charset[i] + charset.Substring(j + 1);
                charset = charset.Substring(0, i) + temp + charset.Substring(i + 1);
            }

            return charset;
        }

        public static bool IsHashId(this string s)
        {
            return !s.IsNullOrWhiteSpace()
                   && s.Length >= MinAlphabetLength
                   && s.ToCharArray().All(c => DefaultAlphabet.Contains(c))
                   && s.ToCharArray().All(c => !DefaultSeps.Contains(c));
        }

        public static string HexToHashId(this string hex)
        {
            if (!_setup) Setup();
            if (!HexValidator.IsMatch(hex)) return string.Empty;
            var matches = HexSplitter.Matches(hex);
            return (from Match match in matches select Convert.ToInt32(string.Concat("1", match.Value), 16))
                .ToArray().ArrayToHashId();
        }

        public static string HexFromHashId(this string hash)
        {
            if (!_setup) Setup();
            if (string.IsNullOrWhiteSpace(hash) || hash.Length < MinAlphabetLength)
                return "";
            var ret = new StringBuilder();
            var numbers = hash.ArrayFromHashId();
            foreach (var number in numbers)
                ret.Append(string.Format("{0:X}", number).Substring(1));
            return ret.ToString();
        }

        public static string ToHashId(this int number)
        {
            return (new[] { number }).ArrayToHashId();
        }

        public static string ArrayToHashId(this int[] numbers)
        {
            if (!_setup) Setup();
            if (numbers == null || numbers.Length == 0) return string.Empty;
            var charset = string.Copy(_alphabet);
            var numbersHashInt = numbers.Select((t, i) => (t % (i + 100))).Sum();
            var lottery = charset[numbersHashInt % charset.Length];
            var ret = lottery.ToString();
            for (var i = 0; i < numbers.Length; i++) {
                var number = numbers[i];
                var buffer = lottery + DefaultSalt + charset;
                charset = ConsistentShuffle(charset, buffer.Substring(0, charset.Length));
                var last = Hash(number, charset);
                ret += last;
                if (i + 1 < numbers.Length) {
                    number %= (last[0] + i);
                    var sepsIndex = number % _seps.Length;
                    ret += _seps[sepsIndex];
                }
            }

            if (ret.Length < MinAlphabetLength) {
                var guardIndex = (numbersHashInt + ret[0]) % _guards.Length;
                var guard = _guards[guardIndex];
                ret = guard + ret;
                if (ret.Length < MinAlphabetLength) {
                    guardIndex = (numbersHashInt + ret[2]) % _guards.Length;
                    guard = _guards[guardIndex];
                    ret += guard;
                }
            }

            var halfLength = (charset.Length / 2);
            while (ret.Length < MinAlphabetLength) {
                charset = ConsistentShuffle(charset, charset);
                ret = charset.Substring(halfLength) + ret + charset.Substring(0, halfLength);
                var excess = ret.Length - MinAlphabetLength;
                if (excess > 0)
                    ret = ret.Substring(excess / 2, MinAlphabetLength);
            }

            return ret;
        }

        public static int FromHashId(this string hash)
        {
            try {
                return hash.ToUpper().ArrayFromHashId().FirstOrDefault();
            } catch (Exception) {
                return 0;
            }
        }

        public static int[] ArrayFromHashId(this string hash)
        {
            if (!_setup) Setup();
            if (string.IsNullOrWhiteSpace(hash) || hash.Length < MinAlphabetLength)
                return new int[0];

            var charset = string.Copy(_alphabet);
            var ret = new List<int>();
            int i = 0;
            var hashBreakdown = _guardsRegex.Replace(hash, " ");
            var hashArray = hashBreakdown.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            if (hashArray.Length == 3 || hashArray.Length == 2)
                i = 1;
            hashBreakdown = hashArray[i];
            if (hashBreakdown[0] != default(char)) {
                var lottery = hashBreakdown[0];
                hashBreakdown = hashBreakdown.Substring(1);
                hashBreakdown = _sepsRegex.Replace(hashBreakdown, " ");
                hashArray = hashBreakdown.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var subHash in hashArray) {
                    var buffer = lottery + DefaultSalt + charset;
                    charset = ConsistentShuffle(charset, buffer.Substring(0, charset.Length));
                    ret.Add(Unhash(subHash, charset));
                }

                if (ret.ToArray().ArrayToHashId() != hash)
                    ret.Clear();
            }

            return ret.ToArray();
        }
    }
}