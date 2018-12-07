using System;
using System.Collections.Generic;
using System.Text;
using Model.Entity;
using Util;

namespace Repository.Entity
{
    [AutoWire()]
    public class StudentRepository
    {
        public IList<Student> List()
        {
            return new List<Student>()
            {
                new Student(){Id= 0, FirstName = "Yu", LastName = "Wang"},
                new Student(){Id= 1, FirstName = "Carmen", LastName = "Zamek"},
                new Student(){Id= 2, FirstName = "Brett", LastName = "McFall"},
                new Student(){Id= 3, FirstName = "Brett", LastName = "Wang"},
                new Student(){Id= 4, FirstName = "Carmen", LastName = "McFall"},
                new Student(){Id= 5, FirstName = "Yu", LastName = "Zamek"},
            };
        }
    }
}
