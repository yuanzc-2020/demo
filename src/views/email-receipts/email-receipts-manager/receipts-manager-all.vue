<template>
    <div class="receipts">
        <Card >
            <Row @keydown.enter.native="handleSearch">
                <Form
                    ref="searchForm"
					:model="searchForm"
					inline
					:label-width="100"
                >
                <!-- 表单内容 -->
                    <Form-item label="单号">
                        <Input v-model="searchForm.applyReceiptsId" placeholder="请输入单号" width="100px"></Input>
                    </Form-item>
                     <Form-item label="申请人">
                        <Input v-model="searchForm.receiptsAddUserId" placeholder="请输入申请人" width="100px"></Input>
                    </Form-item>
					<Form-item label="票据类型">
						<Select
							v-model="searchForm.receiptsType"
							style="width: 250px"
						>
							<Option
								v-for="item in receiptsTypes"
								:value="item.receiptsType"
								:key="item.receiptsType"
								:label="item.typeName"
								>{{ item.typeName }}</Option
							>
						</Select>
					</Form-item>
                    <Form-item label="区域">
                        <Select
							v-model="searchForm.areaId"
							style="width: 250px"
						>
							<Option
								v-for="item in areaIds"
								:value="item.areaId"
								:key="item.areaId"
								:label="item.areaName"
								>{{ item.areaName }}</Option
							>
						</Select>
                    </Form-item>
					<Form-item label="新增时间">
						<DatePicker
							v-model="timeForm.addTime"
							type="daterange"
							format="yyyy-MM-dd"
							@on-change="selectDateRange"
							placeholder="选择起始时间"
							style="width: 250px"
						></DatePicker>
					</Form-item>

					<Form-item style="margin-left: -35px" class="br">
						<Button
							@click="handleSearch"
							type="primary"
							icon="ios-search"
							>查询</Button
						>
						<Button @click="handleReset">重置</Button>
					</Form-item>
                </Form>
            </Row>
            <Row class="operation">
				<Button @click="add" type="primary" icon="md-add"
					>新增收据申请单</Button
				>
				<Button
					@click="processSubmit"
					type="warning"
					icon="md-paper-plane"
					>流程提交</Button
				>
				<Button
					@click="processTrace"
					type="warning"
					icon="md-git-branch"
					>流程跟踪</Button
				>
				<Button type="dashed" @click="getDataList">刷新数据</Button>
				<Button type="dashed" @click="openSearch = !openSearch">{{
					openSearch ? '关闭搜索' : '开启搜索'
				}}</Button>
				<Button type="dashed" @click="openTip = !openTip">{{
					openTip ? '关闭提示' : '开启提示'
				}}</Button>
			</Row>
            <Row>
				<Table
					:loading="loading"
					highlight-row
					border
					:columns="columns"
					:data="data"
					sortable="custom"
					@on-sort-change="changeSort"
					@on-current-change="changeTable"
					@on-selection-change="showSelect"
					ref="table"
					size="small"
				></Table>
			</Row>
			<Row type="flex" justify="end" class="page">
				<Page
					:current="searchForm.pageNumber"
					:total="total"
					:page-size="searchForm.pageSize"
					@on-change="changePage"
					@on-page-size-change="changePageSize"
					:page-size-opts="[10, 20, 50]"
					size="small"
					show-total
					show-elevator
					show-sizer
				></Page>
			</Row>

        </Card>
    </div>
</template>
<script>

// import AllotAdd from './card-bill/bill-allot/bill-allot-form.vue';
// import AllotDetail from './card-bill/bill-allot/bill-allot-detail.vue';
// import ProcessStart from '@/views/card-flow/flow-process/flow-process-start';
// import ProcessHistoricTrace from '@/views/card-flow/flow-historic-detail/flow-historic-trace';
export default {
    name:"receipts-manager",
    components:{
        // AllotAdd,
		// AllotDetail,
		// ProcessStart,
		// ProcessHistoricTrace,
       
    },

    data() {
        return {
            currview:'',
            zero:true,
            data:[],
            total:0,
            searchForm:{
                applyReceiptsId:'',
                receiptsAddUserId:'',
                receiptsType:'',
                areaId:'',
                startDate:'',
                endDate:''
            },
            areaIds:[
                {areaName:'成都锦江区',areaId:'510100000'},
                {areaName:'成都青羊区',areaId:'510100001'},
                {areaName:'成都郫都区',areaId:'510100002'},
                {areaName:'成都双流',areaId:'510100003'},
            ],
            receiptsTypes:[
                {typeName:'未提交',receiptsType:'0'},
                {typeName:'已提交/待审核',receiptsType:'1'},
                {typeName:'业务领导已审核',receiptsType:'2'},
                {typeName:'财务人员审核通过',receiptsType:'2'},
                {typeName:'已经开具电子收据',receiptsType:'2'},
                {typeName:'业务信息处理完成',receiptsType:'2'},
            ],
            columns: [
				{
					type: 'index',
					width: 60,
					align: 'center',
				},
				{
					title: '申请单号',
					key: 'applyReceiptsId',
					width: 200,
					align: 'center',
				},
				{
					title: '流程类型',
					key: 'progressType',
					minWidth: 150,
					align: 'center',
				},
				
				{
					title: '单据状态',
					key: 'statusCode',
					align: 'center',
					minWidth: 130,
					render: (h, params) => {
						let text = '';
						this.statusCodes.forEach((e) => {
							if (e.statusCode == params.row.statusCode) {
								text = e.statusName;
							}
						});
						return h('div', text);
					},
				},
				{
					title: '新增人',
					key: 'receiptsAddUserId',
					width: 150,
					align: 'center',
				},
				{
					title: '新增时间',
					key: 'addTime',
					width: 180,
					align: 'center',
                },
                {
					title: '申请事由',
					key: 'applyFor',
					width: 180,
					align: 'center',
                },
               
                {
					title: '票据金额',
					key: 'totalfee',
					width: 180,
					align: 'center',
                },
                 {
					title: '当前处理人',
					key: 'emailReceiptsExaminerName',
					width: 180,
					align: 'center',
				},
				{
					title: '操作',
					key: 'action',
					align: 'center',
					width: 200,
					render: (h, params) => {
						return h('div', [
							h(
								'Button',
								{
									props: {
										size: 'small',
									},
									style: {
										marginRight: '5px',
									},

									on: {
										click: () => {
											this.details(params.row);
										},
									},
								},
								'详情'
							),
							h(
								'Button',
								{
									props: {
										type: 'primary',
										size: 'small',
										disabled:
											params.row.statusCode == '1000'
												? false
												: true,
									},

									style: {
										marginRight: '5px',
									},
									on: {
										click: () => {
											this.edit(params.row);
										},
									},
								},
								'编辑'
							),
							h(
								'Button',
								{
									props: {
										type: 'error',
										size: 'small',
										disabled:
											params.row.statusCode == '1000'
												? false
												: true,
									},
									style: {
										marginRight: '5px',
									},
									on: {
										click: () => {
											this.remove(params.row);
										},
									},
								},
								'删除'
							),
						]);
					},
				},
			],
            timeForm: {
				addTime: '',
			},
        }
    },
    methods:{
        init() {
            alert("111111111111111");
			// this.setDateDeflut();
			// this.getDataList();
            // this.getStatusCodes();
            this.getDataList();
			
        },
        handleSearch(){
            console.log("aaaaaaa");
        },
        // 获取收据信息
        getDataList(){
            this.loading=true;
            debugger;
			getReceiptsList().then((res) => {
                console.log(res);
				if (res.success) {
                    console.log("2222222222222222222");
					this.data = res.result.content;
					this.total = res.result.total;
				}
			});
		},
        setDateDeflut() {
			let getDatePickerDefault = this.getDatePickerDefault(90, 1);
			this.timeForm.addTime = getDatePickerDefault[0];
			this.searchForm.startDate = getDatePickerDefault[1];
			this.searchForm.endDate = getDatePickerDefault[2];
        },
        handleReset() {
			this.$refs.searchForm.resetFields();
			this.searchForm.pageNumber = 1;
            this.searchForm.pageSize = 10;
            this.searchForm.applyReceiptsId = '';
            this.searchForm.receiptsAddUserId = '';
            this.searchForm.receiptsType = '';
            this.searchForm.areaId = '';
			this.timeForm.addTime = '';
			this.searchForm.startDate = '';
            this.searchForm.endDate = '';
            
			this.getDataList();
        },
        mounted() {
		    this.init();
	}
    }
}
</script>
<style scoped>

</style>