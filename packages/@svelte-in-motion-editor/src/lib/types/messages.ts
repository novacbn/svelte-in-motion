export interface IMessage<
    Name extends String,
    Detail extends Record<string, any> | undefined = undefined
> {
    name: Name;

    detail: Detail;
}
