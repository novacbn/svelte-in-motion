export type IMessage<
    Name extends String,
    Detail extends Record<string, any> | undefined = undefined
> = Detail extends undefined
    ? {name: Name}
    : {
          name: Name;

          detail: Detail;
      };
