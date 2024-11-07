const fs = require('fs');

interface Option {
    text: string;
    isCorrect?: boolean;
}

interface Question {
    text: string;
    options: Option[];
}

const mammoth = require('mammoth');

const convertDocxToTxt = async (inputFile: string, outputFile: string): Promise<string> => {
    try {
        const result = await mammoth.extractRawText({ path: inputFile, skipEmptyElements: true });
        const text = result.value;
        fs.writeFileSync(outputFile, text, 'utf-8');
        console.log(`File converted to text and saved to ${outputFile}`);
        return text;
    } catch (error) {
        console.error("Error while converting document to text:", error);
        return "";
    }
};

const convertTxtToJson = (inputFile: string, outputFile: string, splitQuestionsNumber: number = 1): void => {
    const content = fs.readFileSync(inputFile, 'utf-8');
    const lines = content.split('\n');
    const questions: Question[] = [];
    let currentQuestion: Question | null = null;

    for (const line of lines) {
        if (line.trim() === '') continue;

        if (line.match(/^\d+\./) && !line.match(/^\s*(\d+\.\s*)?[A-D]\)/i)) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            const questionText = line.replace(/^\d+\.\s*/, '').trim();
            currentQuestion = {
                text: questionText.length > 255 ? questionText.slice(0, 255) : questionText,
                options: []
            };
        } else if (line.match(/^\s*(\d+\.\s*)?[A-D]\)/i) || line.startsWith('o ') || line.startsWith('* ')) {
            const optionText = line.replace(/^\s*(\d+\.\s*)?[A-D]\)\s*/i, '').replace(/^[o*]\s*/, '').replace(/[A-D]\)\s*/i, '').trim();
            if (currentQuestion) {
                const isCorrect = line.toLowerCase().includes('correct answer:') ||
                    (currentQuestion.options.length === 0 && line.includes('Correct Answer:'));
                currentQuestion.options.push({
                    text: optionText,
                    ...(isCorrect && { isCorrect })
                });
            }
        } else if (line.includes('Correct Answer:')) {
            const correctAnswerText = line.split('Correct Answer:')[1].replace(/[A-D]\)\s*/i, '').trim();
            if (currentQuestion) {
                const correctOption = currentQuestion.options.find(option =>
                    option.text.toLowerCase().includes(correctAnswerText.toLowerCase())
                );
                if (correctOption) {
                    correctOption.isCorrect = true;
                }
            }
        } else if (line.includes('Answer:')) {
            const correctAnswerText = line.split('Answer:')[1].replace(/[A-D]\)\s*/i, '').trim();
            if (currentQuestion) {
                const correctOption = currentQuestion.options.find(option =>
                    option.text.toLowerCase().includes(correctAnswerText.toLowerCase())
                );
                if (correctOption) {
                    correctOption.isCorrect = true;
                }
            }
        }
    }

    if (currentQuestion && currentQuestion.options.length >= 2) {
        questions.push(currentQuestion);
    }

    function generateOutput(array: Question[], outputFile: string = 'output.json'): void {
        const jsonContent = JSON.stringify(array, null, 2);
        fs.writeFileSync(outputFile, jsonContent);
        console.log(`Generated ${outputFile}`);
    }

    if (splitQuestionsNumber > 1) {
        const middle = Math.ceil(questions.length / splitQuestionsNumber);
        for (let i = 0; i < splitQuestionsNumber; i++) {
            generateOutput(questions.slice(i * middle, (i + 1) * middle), `${outputFile}${i + 1}.json`);
        }

    } else {
        generateOutput(questions);
    }
}

const inputFile = './input.txt';
let input = "";

// convertDocxToTxt("input.docx", './inputx.txt').then(() => {
//     input = fs.readFileSync('./inputx.txt', 'utf-8');
// });
// convertTxtToJson(input, outputFile, 2);

const outputFile = './output.json';

convertTxtToJson(inputFile, outputFile, 2);