import { Document } from 'mongoose';
export type RubricDocument = Rubric & Document;
export declare class Criterion {
    name: string;
    description: string;
    maxScore: number;
}
export declare class Rubric {
    name: string;
    description: string;
    criteria: Criterion[];
}
export declare const RubricSchema: import("mongoose").Schema<Rubric, import("mongoose").Model<Rubric, any, any, any, (Document<unknown, any, Rubric, any, import("mongoose").DefaultSchemaOptions> & Rubric & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Rubric, any, import("mongoose").DefaultSchemaOptions> & Rubric & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, Rubric>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Rubric, Document<unknown, {}, Rubric, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Rubric & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Rubric, Document<unknown, {}, Rubric, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Rubric & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Rubric, Document<unknown, {}, Rubric, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Rubric & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    criteria?: import("mongoose").SchemaDefinitionProperty<Criterion[], Rubric, Document<unknown, {}, Rubric, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Rubric & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Rubric>;
