namespace Model.Interfaces
{
    public interface IHasTypedId<TId>
    {
        TId Id { get; set; }
    }
}
