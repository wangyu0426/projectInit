using System;

namespace Model.Entity
{
    public partial class User 
    {
        public User()
        {
        }

        public int Id { get; set; }
        public Guid Key { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string HomePhone { get; set; }
        public string WorkPhone { get; set; }
        public string Mobile { get; set; }
        public DateTime? DateRegistered { get; set; }
        public byte[] Password { get; set; }
        public byte[] Salt { get; set; }
        public bool? Pending { get; set; }
        public bool? Active { get; set; }
        public string RefreshToken { get; set; }
        public string Avatar { get; set; }
    }
}
