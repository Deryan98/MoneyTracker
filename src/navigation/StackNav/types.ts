import { categoryType } from "@data/categoryType";

export type StackNavParams = {
    Dashboard: undefined;
    Form: {category: categoryType[]};
    FormIcons: {category: categoryType[]};
};