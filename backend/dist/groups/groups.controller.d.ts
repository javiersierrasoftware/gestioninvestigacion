import { GroupsService } from './groups.service';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    create(createGroupDto: any): Promise<import("./schemas/group.schema").Group>;
    seed(): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("./schemas/group.schema").GroupDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/group.schema").Group & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, Omit<{
        name: string;
        categoria: string;
        leaderName: string;
        facultad: string;
    }, "_id">>[] | {
        message: string;
    }>;
    findAll(): Promise<import("./schemas/group.schema").Group[]>;
    findOne(id: string): Promise<import("./schemas/group.schema").Group | null>;
    update(id: string, updateGroupDto: any): Promise<import("./schemas/group.schema").Group | null>;
    remove(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/group.schema").GroupDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/group.schema").Group & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
}
