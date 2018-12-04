using System;
using System.Collections.Generic;
using System.Linq;
using Model.Entity;
using Repository.Common;
using Util;

namespace Repository.Entity
{
    [AutoWire]
    public class ContactRepository: TypedIdRepositoryBase<Contact>{
        public Contact Create(Contact user)
        {
            using (var conn = ContextFactory.Create())
            {
               
                conn.Contact.Add(user);
                conn.SaveChanges();

                return user;
            }
        }
    }
}
