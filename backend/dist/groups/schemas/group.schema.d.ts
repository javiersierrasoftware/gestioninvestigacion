import { Document, Types } from 'mongoose';
export type GroupDocument = Group & Document;
export declare class Group {
    name: string;
    description: string;
    categoria: string;
    leaderName: string;
    leaderEmail: string;
    grupLAC: string;
    facultad: string;
    areaConocimiento: string;
}
export declare const GroupSchema: import("mongoose").Schema<Group, import("mongoose").Model<Group, any, any, any, (Document<unknown, any, Group, any, import("mongoose").DefaultSchemaOptions> & Group & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Group, any, import("mongoose").DefaultSchemaOptions> & Group & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Group>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Group, Document<unknown, {}, Group, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Group & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Group, Document<unknown, {}, Group, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Group & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Group, Document<unknown, {}, Group, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Group & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    categoria?: import("mongoose").SchemaDefinitionProperty<string, Group, Document<unknown, {}, Group, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Group & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    leaderName?: import("mongoose").SchemaDefinitionProperty<string, Group, Document<unknown, {}, Group, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Group & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    leaderEmail?: import("mongoose").SchemaDefinitionProperty<string, Group, Document<unknown, {}, Group, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Group & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    grupLAC?: import("mongoose").SchemaDefinitionProperty<string, Group, Document<unknown, {}, Group, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Group & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    facultad?: import("mongoose").SchemaDefinitionProperty<string, Group, Document<unknown, {}, Group, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Group & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    areaConocimiento?: import("mongoose").SchemaDefinitionProperty<string, Group, Document<unknown, {}, Group, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Group & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Group>;
