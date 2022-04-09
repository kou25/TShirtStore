export default class WhereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }

  search() {
    const searchWord = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "i"
          }
        }
      : {};
    this.base = this.base.find({ ...searchWord });
    return this;
  }
  xw;

  filter() {
    const copyQ = { ...this.bigQ };

    delete copyQ["search"];
    delete copyQ["limit"];
    delete copyQ["page"];

    //convert bigQ into a string => copyQ
    let stringOfCopyQ = JSON.stringify(copyQ);

    stringOfCopyQ = stringOfCopyQ.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (m) => `${m}`
    );

    const jsonOfCopyQ = JSON.parse(stringOfCopyQ);

    this.base = this.base.find(jsonOfCopyQ);
    return this;
  }

  pager(resultPerPage) {
    let currentPage = this.bigQ.page || 1;
    const skip = resultPerPage * (currentPage - 1);
    this.base = this.base.limit(resultPerPage).skip(skip);
    return this;
  }
}
