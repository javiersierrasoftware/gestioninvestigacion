import { Model } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
export declare class GroupsService {
    private groupModel;
    constructor(groupModel: Model<GroupDocument>);
    create(createGroupDto: any): Promise<Group>;
    findAll(): Promise<Group[]>;
    findOne(id: string): Promise<Group | null>;
    update(id: string, updateGroupDto: any): Promise<Group | null>;
    remove(id: string): Promise<(import("mongoose").Document<unknown, {}, GroupDocument, {}, import("mongoose").DefaultSchemaOptions> & Group & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    seedGroups(): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, GroupDocument, {}, import("mongoose").DefaultSchemaOptions> & Group & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
}
