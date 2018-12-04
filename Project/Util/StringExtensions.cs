using System;
using System.Text;

namespace Util
{
    public static class StringExtensions
    {
        public static long ToLong(this string s)
        {
            long l = 0;
            if (!s.IsNullOrWhiteSpace()) Int64.TryParse(s, out l);
            return l;
        }

        public static int ToInteger(this string s)
        {
            int i = 0;
            if (!s.IsNullOrWhiteSpace()) Int32.TryParse(s, out i);
            return i;
        }

        public static double ToDouble(this string s)
        {
            double d = 0;
            if (!s.IsNullOrWhiteSpace()) Double.TryParse(s, out d);
            return d;
        }

        public static float ToFloat(this string s)
        {
            float d = 0;
            if (!s.IsNullOrWhiteSpace()) float.TryParse(s, out d);
            return d;
        }

        public static decimal ToDecimal(this string s)
        {
            decimal d = 0;
            if (!s.IsNullOrWhiteSpace()) Decimal.TryParse(s, out d);
            return d;
        }

        public static bool IsNullOrWhiteSpace(this string str)
        {
            return string.IsNullOrWhiteSpace(str);
        }

        public static bool IsNullOrEmpty(this string str)
        {
            return string.IsNullOrEmpty(str);
        }
        public static string CreateMd5(this string input)
        {
            // Use input string to calculate MD5 hash
            using (System.Security.Cryptography.MD5 md5 = System.Security.Cryptography.MD5.Create()) {
                byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
                byte[] hashBytes = md5.ComputeHash(inputBytes);

                // Convert the byte array to hexadecimal string
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < hashBytes.Length; i++) {
                    sb.Append(hashBytes[i].ToString("X2"));
                }
                return sb.ToString();
            }
        }
    }
}