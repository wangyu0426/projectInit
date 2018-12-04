using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Util;

namespace Logic.Entity
{
    [AutoWire()]
    public class CalculateZerosFromIntHandler : IRequestHandler<CalculateZerosFromInt ,int>
    {
        public async Task<int> Handle(CalculateZerosFromInt request, CancellationToken cancellationToken) {
           return Calculate(request.Number);
        }
        int Calculate(int n)
        {
            int count = 0;
            while (n != 0) {
                if (n % 2 == 0) {
                    count++;
                }
                n /= 2;
            }
            return count;
        }
    }

    public class CalculateZerosFromInt : IRequest<int> {
        public int Number { get; set; } 
    }
}
