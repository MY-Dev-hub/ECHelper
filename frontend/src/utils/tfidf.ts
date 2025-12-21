// TF-IDF 계산 유틸리티

interface TFIDFResult {
  itemId: number;
  similarity: number;
}

// 텍스트 전처리 (토크나이징)
export const tokenize = (text: string): string[] => {
  if (!text) return [];
  
  // 한글, 영문, 숫자만 추출
  const cleaned = text.toLowerCase()
    .replace(/[^\wㄱ-ㅎ가-힣a-z0-9\s]/g, ' ');
  
  // 공백으로 분리
  const tokens = cleaned.split(/\s+/).filter(t => t.length > 1);
  
  return tokens;
};

// 불용어 제거
const stopWords = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  '이', '그', '저', '것', '수', '등', '및', '위한', '있는', '하는', '되는',
  '관련', '장비', '시스템', '기술', '설계', '제조'
]);

export const removeStopWords = (tokens: string[]): string[] => {
  return tokens.filter(token => !stopWords.has(token));
};

// Term Frequency 계산
export const calculateTF = (tokens: string[]): Map<string, number> => {
  const tf = new Map<string, number>();
  const totalTerms = tokens.length;
  
  tokens.forEach(token => {
    tf.set(token, (tf.get(token) || 0) + 1);
  });
  
  // 정규화 (빈도 / 전체 단어 수)
  tf.forEach((count, term) => {
    tf.set(term, count / totalTerms);
  });
  
  return tf;
};

// Inverse Document Frequency 계산
export const calculateIDF = (documents: string[][]): Map<string, number> => {
  const idf = new Map<string, number>();
  const totalDocs = documents.length;
  
  // 각 단어가 몇 개 문서에 등장하는지 계산
  const docFrequency = new Map<string, number>();
  
  documents.forEach(doc => {
    const uniqueTerms = new Set(doc);
    uniqueTerms.forEach(term => {
      docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
    });
  });
  
  // IDF = log(전체 문서 수 / 단어가 등장한 문서 수)
  docFrequency.forEach((freq, term) => {
    idf.set(term, Math.log(totalDocs / freq));
  });
  
  return idf;
};

// TF-IDF 벡터 계산
export const calculateTFIDF = (
  tf: Map<string, number>,
  idf: Map<string, number>
): Map<string, number> => {
  const tfidf = new Map<string, number>();
  
  tf.forEach((tfValue, term) => {
    const idfValue = idf.get(term) || 0;
    tfidf.set(term, tfValue * idfValue);
  });
  
  return tfidf;
};

// 코사인 유사도 계산
export const cosineSimilarity = (
  vec1: Map<string, number>,
  vec2: Map<string, number>
): number => {
  // 내적 계산
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  // 모든 단어 수집
  const allTerms = new Set([...vec1.keys(), ...vec2.keys()]);
  
  allTerms.forEach(term => {
    const v1 = vec1.get(term) || 0;
    const v2 = vec2.get(term) || 0;
    
    dotProduct += v1 * v2;
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  });
  
  // 코사인 유사도
  if (norm1 === 0 || norm2 === 0) return 0;
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};

// 유사한 문서 찾기 (메인 함수)
export const findSimilarDocuments = (
  query: string,
  documents: any[],
  topN: number = 5
): TFIDFResult[] => {
  // 1. 쿼리 토크나이징
  const queryTokens = removeStopWords(tokenize(query));
  
  if (queryTokens.length === 0) {
    return [];
  }
  
  // 2. 모든 문서 토크나이징
  const documentTexts = documents.map(doc => {
    const combined = `${doc.title || ''} ${doc.description || ''} ${doc.purpose || ''} ${doc.application || ''}`;
    return removeStopWords(tokenize(combined));
  });
  
  // 3. IDF 계산 (전체 문서 기준)
  const idf = calculateIDF([queryTokens, ...documentTexts]);
  
  // 4. 쿼리 TF-IDF 계산
  const queryTF = calculateTF(queryTokens);
  const queryTFIDF = calculateTFIDF(queryTF, idf);
  
  // 5. 각 문서와 유사도 계산
  const similarities: TFIDFResult[] = documents.map((doc, index) => {
    const docTokens = documentTexts[index];
    const docTF = calculateTF(docTokens);
    const docTFIDF = calculateTFIDF(docTF, idf);
    
    const similarity = cosineSimilarity(queryTFIDF, docTFIDF);
    
    return {
      itemId: index,
      similarity: similarity
    };
  });
  
  // 6. 유사도 순으로 정렬하고 상위 N개 반환
  return similarities
    .filter(s => s.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
};