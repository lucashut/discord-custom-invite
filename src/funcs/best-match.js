function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = [];

    for (let i = 0; i <= m; i++) {
        dp[i] = [];
        for (let j = 0; j <= n; j++) {
            if (i === 0) {
                dp[i][j] = j;
            } else if (j === 0) {
                dp[i][j] = i;
            } else {
                dp[i][j] = Math.min(
                dp[i - 1][j - 1] + (str1.charAt(i - 1) !== str2.charAt(j - 1) ? 1 : 0),
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1
                );
            }
        }
    }  

    return dp[m][n];
}


module.exports = {
    findBestMatch(target, stringList) {
        let bestMatch = null;
        let minDistance = Infinity;
        
        for (let i = 0; i < stringList.length; i++) {
            const currentString = stringList[i];
            const distance = levenshteinDistance(target.toLowerCase(), currentString.toLowerCase());
        
            if (distance < minDistance) {
            minDistance = distance;
            bestMatch = currentString;
            }
        }
        
        return bestMatch;
    }
}

