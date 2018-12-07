using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Entity
{
    public class Notification
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime DateTime { get; set; }
        public bool IsRead { get; set; }


        public Student Student { get; set; }
    }
}
