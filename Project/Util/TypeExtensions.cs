using System;

namespace Util
{
    public static class TypeExtensions
    {
        public static bool HasAttribute<TAttribute>(this Type type) where TAttribute : Attribute
        {
            var attributes = type.GetCustomAttributes(typeof(TAttribute), true);
            return attributes.Length > 0;
        }
    }
}
