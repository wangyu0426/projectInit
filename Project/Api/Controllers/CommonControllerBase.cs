using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Model.Entity;
using Repository.Entity;
using Util;

namespace Api.Controllers
{
    public abstract class CommonControllerBase : ControllerBase
    {
        public ContactRepository ContactRepository { get; set; }
        private Contact _contact;
        private Project _project;


        protected Contact Contact
        {
            get
            {
                if (_contact == null)
                {
                    _contact = ContactRepository.Get(HttpContext.User.Identity.Name.ToInteger());
                }
                return _contact;
            }
        }
    }
}
