using System;

namespace Shared.Helpers
{
    public static class ServiceFabricHelper
    {
        public static bool IsRunningInServiceFabric()
        {
            return !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("Fabric_Folder")) ||
                   !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("Fabric_ApplicationName"));
        }
    }
}
