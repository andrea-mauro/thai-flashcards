export interface Flashcard {
    id: string;
    thai: string;
    romanization: string;
    english: string;
    category: string[];
}

export interface ThaiItem {
    id: number;
    english: string;
    thai: string;
    roman: string;
}

export interface ThaiResult {
    thai: string;
    roman: string;
}

export interface Time {
    h: number;
    m: number;
}
