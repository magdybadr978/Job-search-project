
export class ApiFeatures {
  constructor(mongooseQuery, queryData) {
    this.mongooseQuery = mongooseQuery;
    this.queryData = queryData;
  }
  pagination = async (model, condition = {}) => {
    let page = this.queryData.page;
    let size = this.queryData.size;
    if (page <= 0 || !page) {
      page = 1;
    }
    if (size <= 0 || !size) {
      size = 5;
    }
    const skip = size * (page - 1);
    await model.countDocuments(condition).then((value) => {
      const total = Math.ceil(value / size);
      this.queryData.value = value;
      this.queryData.total = total;
    });

    this.mongooseQuery.find(condition).skip(skip).limit(size);

    return this;
  };


  filter = async () => {
    const execluded = ["sort", "page", "size", "fields", "searchKey"];
    let queryFields = { ...this.queryData };
    execluded.forEach((ele) => {
      delete queryFields[ele];
    });
    // if you want to replace you must use string
    queryFields = JSON.stringify(queryFields).replace(
      /lte|lt|gt|gte/g, // >>> can you use equal only!
      (match) => {
        return `$${match}`;
      }
    );
    queryFields = JSON.parse(queryFields);
    this.mongooseQuery.find(queryFields);
    return this;
  };

  sort() {
    let sorted = "-createdAt"
    if (this.queryData.sort) {
      sorted = this.queryData.sort.replace(/,/g, " ")
    }
    this.mongooseQuery.sort(sorted);
    return this;
  };


  userSearch(filter) {
    if (this.queryData.searchKey) {
      this.mongooseQuery.find({
        ...filter,
        $or: [
          { userName: { $regex: this.queryData.searchKey } },
          { phone: { $regex: this.queryData.searchKey } }
        ],
      })
    } else {
      this.mongooseQuery.find(filter)
    };
    return this;
  }

  select() {
    this.mongooseQuery.select(this.queryData.fields?.replace(/,/g, " "));
    return this;
  };
  
}