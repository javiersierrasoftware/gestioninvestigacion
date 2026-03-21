declare class CriterionDto {
    name: string;
    description?: string;
    maxScore: number;
}
export declare class CreateRubricDto {
    name: string;
    description?: string;
    criteria?: CriterionDto[];
}
export {};
