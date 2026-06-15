using System.Collections.Generic;
using System.Fabric;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

namespace ActivityService
{
    public class ServiceFabricActivityService : StatefulService
    {
        public ServiceFabricActivityService(StatefulServiceContext context)
            : base(context)
        { }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return new ServiceReplicaListener[]
            {
                new ServiceReplicaListener(serviceContext =>
                    new KestrelCommunicationListener(serviceContext, (url, listener) =>
                    {
                        var builder = WebApplication.CreateBuilder();
                        builder.WebHost
                            .UseKestrel()
                            .UseContentRoot(Directory.GetCurrentDirectory())
                            .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.UseUniqueServiceUrl)
                            .UseUrls(url);

                        Program.ConfigureServices(builder.Services, builder.Configuration, isServiceFabric: true);
                        builder.Services.AddSingleton<StatefulServiceContext>(serviceContext);
                        builder.Services.AddSingleton(this.StateManager);

                        var app = builder.Build();
                        Program.ConfigurePipeline(app);
                        return app;
                    }))
            };
        }
    }
}
