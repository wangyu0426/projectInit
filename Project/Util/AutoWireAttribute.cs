using System;
using System.Linq;
using System.Reflection;
using Autofac;

namespace Util
{
    public class AutoWireAttribute : Attribute
    {
        public AutoWireAttribute(AutoWireScope scope = AutoWireScope.InstancePerLifetimeScope, Type wiredAs = null)
        {
            WiredAs = wiredAs;
            Scope = scope;
        }

        public Type WiredAs { get; set; }
        public AutoWireScope Scope { get; set; }

        public static void Register(Assembly assembly, ContainerBuilder builder)
        {
            try
            {
                var types = assembly.GetTypes()
                    .Where(T => T.HasAttribute<AutoWireAttribute>());

                foreach (var type in types)
                {

                    if (type.GetCustomAttributes(typeof(AutoWireAttribute), true)
                        .FirstOrDefault() is AutoWireAttribute attr)
                    {
                        var build = builder.RegisterType(attr.WiredAs??type)
                            .PropertiesAutowired();
                        switch (attr.Scope)
                        {
                            case AutoWireScope.SingleInstance:
                                build.SingleInstance();
                                break;
                            case AutoWireScope.InstancePerLifetimeScope:
                                build.InstancePerLifetimeScope();
                                break;
                            case AutoWireScope.InstancePerRequest:
                                build.InstancePerRequest();
                                break;
                            case AutoWireScope.InstancePerDependency:
                                build.InstancePerDependency();
                                break;
                        }
                    }
                }
            }
            catch (ReflectionTypeLoadException ex)
            {
                throw new Exception("Failed to load components (see log for details), first: " + (ex.LoaderExceptions.FirstOrDefault()?.Message ?? ""));
            }
        }
    }
    public enum AutoWireScope
    {
        SingleInstance,
        InstancePerLifetimeScope,
        InstancePerRequest,
        InstancePerDependency
    }
}
