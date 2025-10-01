using SpacetimeDB;

public static partial class Module
{
    [Table(Name = "user", Public = true)]
    public partial class User
    {
        [PrimaryKey]
        public Identity Identity;
        public string? Name;
        public bool Online;
        public float CursorX;
        public float CursorY;
    }

    [Table(Name = "shape", Public = true)]
    public partial class Shape
    {
        [PrimaryKey]
        public uint Id;
        public string? Type;
        public float X;
        public float Y;
        public float Width;
        public float Height;
        public string? Color;
        public float Rotation;
        public Identity CreatedBy;
        public Timestamp CreatedAt;
    }

    [Reducer]
    public static void CreateShape(ReducerContext ctx, string type, float x, float y, float width, float height, string color)
    {
        ctx.Db.shape.Insert(new Shape
        {
            Id = (uint)Random.Shared.Next(),
            Type = type,
            X = x,
            Y = y,
            Width = width,
            Height = height,
            Color = color,
            Rotation = 0.0f,
            CreatedBy = ctx.Sender,
            CreatedAt = ctx.Timestamp
        });
    }

    [Reducer]
    public static void MoveShape(ReducerContext ctx, uint shapeId, float newX, float newY)
    {
        if (ctx.Db.shape.Id.Find(shapeId) is Shape shape)
        {
            shape.X = newX;
            shape.Y = newY;
            ctx.Db.shape.Id.Update(shape);
        }
    }

    [Reducer]
    public static void UpdateShape(ReducerContext ctx, uint shapeId, float? width, float? height, string? color, float? rotation)
    {
        if (ctx.Db.shape.Id.Find(shapeId) is Shape shape)
        {
            if (width.HasValue) shape.Width = width.Value;
            if (height.HasValue) shape.Height = height.Value;
            if (color != null) shape.Color = color;
            if (rotation.HasValue) shape.Rotation = rotation.Value;
            ctx.Db.shape.Id.Update(shape);
        }
    }

    [Reducer]
    public static void DeleteShape(ReducerContext ctx, uint shapeId)
    {
        ctx.Db.shape.Id.Delete(shapeId);
    }

    [Reducer(ReducerKind.ClientConnected)]
    public static void ClientConnected(ReducerContext ctx)
    {
        if (ctx.Db.user.Identity.Find(ctx.Sender) is User user)
        {
            user.Online = true;
            ctx.Db.user.Identity.Update(user);
        }
        else
        {
            ctx.Db.user.Insert(new User
            {
                Identity = ctx.Sender,
                Name = null,
                Online = true,
                CursorX = 0.0f,
                CursorY = 0.0f
            });
        }
    }

    [Reducer(ReducerKind.ClientDisconnected)]
    public static void ClientDisconnected(ReducerContext ctx)
    {
        if (ctx.Db.user.Identity.Find(ctx.Sender) is User user)
        {
            user.Online = false;
            ctx.Db.user.Identity.Update(user);
        }
    }

    [Reducer]
    public static void UpdateCursor(ReducerContext ctx, float x, float y)
    {
        if (ctx.Db.user.Identity.Find(ctx.Sender) is User user)
        {
            user.CursorX = x;
            user.CursorY = y;
            ctx.Db.user.Identity.Update(user);
        }
    }

    [Reducer]
    public static void SetUserName(ReducerContext ctx, string name)
    {
        if (ctx.Db.user.Identity.Find(ctx.Sender) is User user)
        {
            user.Name = name;
            ctx.Db.user.Identity.Update(user);
        }
    }
}
