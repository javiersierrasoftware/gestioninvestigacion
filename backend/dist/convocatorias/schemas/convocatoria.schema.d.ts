import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
export type ConvocatoriaDocument = Convocatoria & Document;
export declare enum FieldType {
    TEXT = "text",
    TEXTAREA = "textarea",
    NUMBER = "number",
    FILE = "file",
    DATE = "date",
    TABLE = "table"
}
export declare class DynamicField {
    name: string;
    label: string;
    helpText: string;
    placeholder: string;
    type: FieldType;
    required: boolean;
    options: string[];
    columns: string[];
}
export declare const DynamicFieldSchema: mongoose.Schema<DynamicField, mongoose.Model<DynamicField, any, any, any, (mongoose.Document<unknown, any, DynamicField, any, mongoose.DefaultSchemaOptions> & DynamicField & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (mongoose.Document<unknown, any, DynamicField, any, mongoose.DefaultSchemaOptions> & DynamicField & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}), any, DynamicField>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, DynamicField, mongoose.Document<unknown, {}, DynamicField, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<DynamicField & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: mongoose.SchemaDefinitionProperty<string, DynamicField, mongoose.Document<unknown, {}, DynamicField, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<DynamicField & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    label?: mongoose.SchemaDefinitionProperty<string, DynamicField, mongoose.Document<unknown, {}, DynamicField, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<DynamicField & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    helpText?: mongoose.SchemaDefinitionProperty<string, DynamicField, mongoose.Document<unknown, {}, DynamicField, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<DynamicField & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    placeholder?: mongoose.SchemaDefinitionProperty<string, DynamicField, mongoose.Document<unknown, {}, DynamicField, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<DynamicField & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: mongoose.SchemaDefinitionProperty<FieldType, DynamicField, mongoose.Document<unknown, {}, DynamicField, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<DynamicField & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    required?: mongoose.SchemaDefinitionProperty<boolean, DynamicField, mongoose.Document<unknown, {}, DynamicField, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<DynamicField & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    options?: mongoose.SchemaDefinitionProperty<string[], DynamicField, mongoose.Document<unknown, {}, DynamicField, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<DynamicField & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    columns?: mongoose.SchemaDefinitionProperty<string[], DynamicField, mongoose.Document<unknown, {}, DynamicField, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<DynamicField & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, DynamicField>;
export declare class Convocatoria {
    title: string;
    number: string;
    year: number;
    directedTo: string;
    budgetPerProject: number;
    description: string;
    startDate: Date;
    endDate: Date;
    dynamicFields: DynamicField[];
    isActive: boolean;
    rubricId: string;
}
export declare const ConvocatoriaSchema: mongoose.Schema<Convocatoria, mongoose.Model<Convocatoria, any, any, any, (mongoose.Document<unknown, any, Convocatoria, any, mongoose.DefaultSchemaOptions> & Convocatoria & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (mongoose.Document<unknown, any, Convocatoria, any, mongoose.DefaultSchemaOptions> & Convocatoria & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}), any, Convocatoria>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Convocatoria, mongoose.Document<unknown, {}, Convocatoria, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<Convocatoria & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    title?: mongoose.SchemaDefinitionProperty<string, Convocatoria, mongoose.Document<unknown, {}, Convocatoria, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Convocatoria & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    number?: mongoose.SchemaDefinitionProperty<string, Convocatoria, mongoose.Document<unknown, {}, Convocatoria, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Convocatoria & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    year?: mongoose.SchemaDefinitionProperty<number, Convocatoria, mongoose.Document<unknown, {}, Convocatoria, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Convocatoria & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    directedTo?: mongoose.SchemaDefinitionProperty<string, Convocatoria, mongoose.Document<unknown, {}, Convocatoria, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Convocatoria & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    budgetPerProject?: mongoose.SchemaDefinitionProperty<number, Convocatoria, mongoose.Document<unknown, {}, Convocatoria, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Convocatoria & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: mongoose.SchemaDefinitionProperty<string, Convocatoria, mongoose.Document<unknown, {}, Convocatoria, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Convocatoria & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    startDate?: mongoose.SchemaDefinitionProperty<Date, Convocatoria, mongoose.Document<unknown, {}, Convocatoria, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Convocatoria & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    endDate?: mongoose.SchemaDefinitionProperty<Date, Convocatoria, mongoose.Document<unknown, {}, Convocatoria, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Convocatoria & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    dynamicFields?: mongoose.SchemaDefinitionProperty<DynamicField[], Convocatoria, mongoose.Document<unknown, {}, Convocatoria, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Convocatoria & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isActive?: mongoose.SchemaDefinitionProperty<boolean, Convocatoria, mongoose.Document<unknown, {}, Convocatoria, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Convocatoria & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    rubricId?: mongoose.SchemaDefinitionProperty<string, Convocatoria, mongoose.Document<unknown, {}, Convocatoria, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<Convocatoria & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Convocatoria>;
