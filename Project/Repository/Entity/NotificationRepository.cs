using System;
using System.Collections.Generic;
using System.Text;
using Model.Entity;
using Util;

namespace Repository.Entity
{
    [AutoWire()]
    public class NotificationRepository
    {
        public IList<Notification> List()
        {
            return new List<Notification>()
            {
                new Notification() { Student = new Student()
                {
                    FirstName = "Jenny", LastName = "Viski"
                },
                    Title = "cancelled without tuition charge",
                    Description = "@pete Sorry to cancel, my son has fallen sick today. something here for more text to have elipises",
                    DateTime = DateTime.UtcNow, IsRead = false}
                , new Notification() { Student = new Student()
                {
                    FirstName = "John", LastName = "Smith"
                },
                    Title = "cancelled without tuition charge",
                    Description = "",
                    DateTime = DateTime.UtcNow.Subtract(new TimeSpan(1,0,0,0)), IsRead = false}
                
            };
        }
    }
}
