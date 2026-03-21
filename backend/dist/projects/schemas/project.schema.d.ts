import { Document, Types } from 'mongoose';
export type ProjectDocument = Project & Document;
export declare enum ProjectStatus {
    BORRADOR = "borrador",
    RADICADO = "radicado",
    EN_REVISION = "en_revision",
    APROBADO = "aprobado",
    RECHAZADO = "rechazado"
}
export declare class ProjectEvaluation {
    evaluator: Types.ObjectId;
    status: string;
    scores: Record<string, number>;
    criterionComments: Record<string, string>;
    comments: string;
    totalScore: number;
}
export declare const ProjectEvaluationSchema: import("mongoose").Schema<ProjectEvaluation, import("mongoose").Model<ProjectEvaluation, any, any, any, (Document<unknown, any, ProjectEvaluation, any, import("mongoose").DefaultSchemaOptions> & ProjectEvaluation & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, ProjectEvaluation, any, import("mongoose").DefaultSchemaOptions> & ProjectEvaluation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, ProjectEvaluation>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProjectEvaluation, Document<unknown, {}, ProjectEvaluation, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ProjectEvaluation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    evaluator?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ProjectEvaluation, Document<unknown, {}, ProjectEvaluation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectEvaluation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, ProjectEvaluation, Document<unknown, {}, ProjectEvaluation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectEvaluation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    scores?: import("mongoose").SchemaDefinitionProperty<Record<string, number>, ProjectEvaluation, Document<unknown, {}, ProjectEvaluation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectEvaluation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    criterionComments?: import("mongoose").SchemaDefinitionProperty<Record<string, string>, ProjectEvaluation, Document<unknown, {}, ProjectEvaluation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectEvaluation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    comments?: import("mongoose").SchemaDefinitionProperty<string, ProjectEvaluation, Document<unknown, {}, ProjectEvaluation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectEvaluation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    totalScore?: import("mongoose").SchemaDefinitionProperty<number, ProjectEvaluation, Document<unknown, {}, ProjectEvaluation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectEvaluation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ProjectEvaluation>;
export declare class Project {
    title: string;
    summary: string;
    convocatoria: Types.ObjectId;
    investigadorPrincipal: Types.ObjectId;
    executionMonths: number;
    group: Types.ObjectId;
    participatingGroups: Types.ObjectId[];
    teamMembers: any[];
    dynamicResponses: Record<string, any>;
    status: ProjectStatus;
    resolutionComments: string;
    evaluations: ProjectEvaluation[];
}
export declare const ProjectSchema: import("mongoose").Schema<Project, import("mongoose").Model<Project, any, any, any, (Document<unknown, any, Project, any, import("mongoose").DefaultSchemaOptions> & Project & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Project, any, import("mongoose").DefaultSchemaOptions> & Project & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Project>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Project, Document<unknown, {}, Project, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    title?: import("mongoose").SchemaDefinitionProperty<string, Project, Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    summary?: import("mongoose").SchemaDefinitionProperty<string, Project, Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    convocatoria?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Project, Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    investigadorPrincipal?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Project, Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    executionMonths?: import("mongoose").SchemaDefinitionProperty<number, Project, Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    group?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Project, Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    participatingGroups?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Project, Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    teamMembers?: import("mongoose").SchemaDefinitionProperty<any[], Project, Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    dynamicResponses?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Project, Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<ProjectStatus, Project, Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    resolutionComments?: import("mongoose").SchemaDefinitionProperty<string, Project, Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    evaluations?: import("mongoose").SchemaDefinitionProperty<ProjectEvaluation[], Project, Document<unknown, {}, Project, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Project>;
