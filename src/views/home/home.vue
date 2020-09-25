<style lang="less">
@import './home.less';
@import '../../styles/common.less';
</style>

<template>
	<div>
		<div class="home">
			<Row :gutter="10">
				<Col :md="24" :xl="24">
					<Row :gutter="10">
						<Col :lg="12" :xl="8" style="margin-bottom: 10px;">
							<Card>
								<Row type="flex" class="user-info">
									<Col span="24" style="padding-left:6px;">
										<Row class-name="made-child-con-middle" type="flex" align="middle">
											<div>
												<b class="card-user-info-name">{{ userName }}</b>
												<p>欢迎您的使用</p>
											</div>
										</Row>
									</Col>
								</Row>
								<div class="line-gray"></div>
								<Row class="margin-top-8">
									<Col span="24" class="padding-left-2">单位信息：{{corpId}}/{{corpName}}</Col>
								</Row>
								<Row class="margin-top-8">
									<Col span="24" class="padding-left-2">单位级别：{{corpLevelName}}</Col>
								</Row>
							</Card>
						</Col>
						<Col :lg="12" :xl="16" style="margin-bottom: 10px;">
							<Card>
								<p slot="title">
									<a target="_blank">信息</a>
								</p>
								<p slot="extra">
									<a target="_blank" href>haha</a>
								</p>
								<div style="height: 110px;"></div>
							</Card>
						</Col>
					</Row>
				</Col>
			</Row>
			<row>
				<dashboard1 />
			</row>
		</div>
	</div>
</template>

<script>
import {} from '@/api/card-system-api';
import visitAgentDesktop from './components/visit-agent-desktop.vue';
import visitChannelDesktop from './components/visit-channel-desktop.vue';
import visitCorpDesktop from './components/visit-corp-desktop.vue';
import dashboard1 from '../xboot-charts/dashboard1/dashboard1';
import 'gitalk/dist/gitalk.css';
import Gitalk from 'gitalk';

export default {
	name: 'home',
	components: {
		visitAgentDesktop,
		visitChannelDesktop,
		visitCorpDesktop,
		dashboard1
	},
	data() {
		return {
			showVideo: false,
			count: {
				createUser: 496,
				visit: 3264,
				collection: 24389305,
				transfer: 39503498
			},
			userId: '',
			userName: '',
			corpId: '',
			corpName: '',
			corpLevel: '',
			corpLevelName: '',
			phone: ''
		};
	},
	computed: {
		currNav() {
			return this.$store.state.app.currNav;
		},
		avatarPath() {
			return localStorage.avatorImgPath;
		}
	},
	methods: {
		init() {
			let userInfo = JSON.parse(this.getStore('loginUserInfo'));
			this.userId = userInfo.userId;
			this.userName = userInfo.userName;
			this.corpId = userInfo.corpId;
			this.corpName = userInfo.corpName;
			if (userInfo.corpLevel == 1) {
				this.corpLevelName = '省公司用户';
			} else if (userInfo.corpLevel == 2) {
				this.corpLevelName = '市公司用户';
			} else if (userInfo.corpLevel == 3) {
				this.corpLevelName = '县公司用户';
			} else if (userInfo.corpLevel == 4) {
				this.corpLevelName = '代理商用户';
			} else if (userInfo.corpLevel == 5) {
				this.corpLevelName = '渠厅店用户';
			}
			this.corpLevel = userInfo.corpLevel;
			this.phone = userInfo.phone;
		}
	},
	mounted() {
		this.init();
	}
};
</script>
