using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Model.Interfaces;
using Util;

namespace Repository.Common
{
    public interface ITypedIdRepositoryBase<T> where T : class, IHasTypedId<int>
    {
        IList<T> Get( IList<T> ts);
        IList<int> GetIds( IList<T> ts);
        T Get( int id);
        IList<T> CreateOrUpdateById( IList<T> ts);
        void Delete(int id);
    }

    public abstract class TypedIdRepositoryBase<T> : RepositoryBase<T>, ITypedIdRepositoryBase<T> where T : class, IHasTypedId<int>
    {
        public virtual IList<T> Get( IList<T> ts)
        {
            using (var conn = ContextFactory.Create())
            {
                var list = ts.SelectMany(t => conn.Set<T>().Where(x => t.Id == x.Id)).ToList();
                list.ForEach(t => conn.Entry(t).State = EntityState.Detached);
                return list;
            }
        }

        public virtual IList<int> GetIds( IList<T> ts)
        {
            using (var conn = ContextFactory.Create())
            {
                var list = ts.SelectMany(t => conn.Set<T>().Where(x => t.Id == x.Id)
                    .Select(item => item.Id).ToList()).ToList();
                return list;
            }
        }
        public virtual T Get( int id)
        {
            using (var conn = ContextFactory.Create())
            {
                var item = conn.Set<T>().FirstOrDefault(x => id == x.Id);
                if (item != null) conn.Entry(item).State = EntityState.Detached;
                return item;
            }
        }

        public virtual void Delete(int id)
        {
            using (var conn = ContextFactory.Create())
            {
                conn.Remove(conn.Set<T>().Where(o => o.Id == id));
                conn.SaveChanges();
            }
        }
        public virtual IList<T> CreateOrUpdateById( IList<T> ts)
        {
            using (var conn = ContextFactory.Create())
            {
                ts.ForEach(t => {
                    if (t.Id > 0) conn.Update<T>(t);
                    else
                    {
                        conn.Set<T>().Add(t);
                    }
                });
                conn.SaveChanges();
                ts.ForEach(t => conn.Entry(t).State = EntityState.Detached);
                return ts;
            }
        }

    }
}