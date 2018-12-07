using System;
using System.Collections.Generic;
using System.Text;
using Model.Entity;
using Util;

namespace Repository.Entity
{
    [AutoWire()]
    public class UserRepository
    {
        public User GetById(int id)
        {
            // always return 1
            return  new User(){ Id = 1, FirstName = "Yu", LastName = "Wang" };
        }
    }
}
