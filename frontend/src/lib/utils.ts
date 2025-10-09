export const middleEllipsis = (str: string, len: number) => {
    if (!str) {
      return '';
    }
  
    return `${str.substr(0, len)}...${str.substr(str.length - len, str.length)}`;
  };

  export function abbreviateMoney(amount: number | string): string {
    if (typeof amount === "string") amount = Number(amount)

    if (amount < 1000) return amount.toString();
  
    const units = [
      { value: 1e12, symbol: "T" }, // Trillion
      { value: 1e9, symbol: "B" }, // Billion
      { value: 1e6, symbol: "M" }, // Million
      { value: 1e3, symbol: "k" }, // Thousand
    ];
  
    for (const unit of units) {
      if (amount >= unit.value) {
        let short = amount / unit.value;
        let str =
          short < 10
            ? short.toFixed(1).replace(/\.0$/, "")
            : short.toString();
        let result = str + unit.symbol;
        if (result.length > 4) {
          result = short + unit.symbol;
        }
        return result;
      }
    }
  
    return amount.toString();
  }